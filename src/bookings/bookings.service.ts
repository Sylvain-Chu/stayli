import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Booking, Client, Property, Prisma, Invoice, BookingStatus } from '@prisma/client';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { CreateBookingDto } from './dto/create-booking.dto';
import { paginatePrisma } from '../common/prisma-pagination.util';
import { BookingPriceCalculator } from './booking-price.calculator';
import { SettingsService } from '../settings/settings.service';

export type BookingWithRelations = Booking & {
  property: Property;
  client: Client;
  invoice: Invoice | null;
};
type DateRange = { start?: Date; end?: Date };

// Narrow and validate booking status without referencing enum static members
function isValidBookingStatus(s: unknown): s is BookingStatus {
  return typeof s === 'string' && Object.values(BookingStatus).includes(s as BookingStatus);
}

export type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'name';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private priceCalculator: BookingPriceCalculator,
    private settingsService: SettingsService,
  ) {}

  async findAll(
    {
      from,
      to,
      status,
      q,
    }: { from?: Date; to?: Date; status?: BookingStatus | undefined; q?: string } = {},
    sort: SortOption = 'newest',
    limit = 10,
    page = 1,
  ): Promise<{ data: BookingWithRelations[]; totalCount: number }> {
    // Build where clause
    const where: Prisma.BookingWhereInput = {
      ...(from ? { endDate: { gte: from } } : {}),
      ...(to ? { startDate: { lte: to } } : {}),
      ...(status ? { status } : {}),
      ...(q
        ? {
            OR: [
              { property: { name: { contains: q, mode: 'insensitive' } } },
              { client: { firstName: { contains: q, mode: 'insensitive' } } },
              { client: { lastName: { contains: q, mode: 'insensitive' } } },
              {
                client: {
                  AND: [
                    { firstName: { contains: q.split(' ')[0] || '', mode: 'insensitive' } },
                    { lastName: { contains: q.split(' ')[1] || '', mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
    };

    // Build orderBy clause
    let orderBy: Prisma.BookingOrderByWithRelationInput;
    switch (sort) {
      case 'oldest':
        orderBy = { startDate: 'asc' };
        break;
      case 'price-high':
        orderBy = { totalPrice: 'desc' };
        break;
      case 'price-low':
        orderBy = { totalPrice: 'asc' };
        break;
      case 'name':
        orderBy = { property: { name: 'asc' } };
        break;
      case 'newest':
      default:
        orderBy = { startDate: 'desc' };
        break;
    }

    return paginatePrisma<BookingWithRelations>({
      model: this.prisma.booking,
      where,
      orderBy,
      page,
      perPage: limit,
      include: { property: true, client: true, invoice: true },
    });
  }

  async findOverlappingRange(range?: DateRange): Promise<BookingWithRelations[]> {
    const { start, end } = range ?? {};
    const where =
      start && end
        ? {
            AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
          }
        : undefined;

    return this.prisma.booking.findMany({
      where,
      include: { property: true, client: true, invoice: true },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(data: CreateBookingDto): Promise<Booking> {
    // Basic validations
    if (!data.startDate || !data.endDate) {
      throw new BadRequestException('Start and end dates are required');
    }
    if (!(data.startDate instanceof Date) || Number.isNaN(data.startDate.getTime())) {
      throw new BadRequestException('Invalid start date');
    }
    if (!(data.endDate instanceof Date) || Number.isNaN(data.endDate.getTime())) {
      throw new BadRequestException('Invalid end date');
    }
    if (data.endDate <= data.startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Prevent overlapping bookings on the same property
    const overlap = await this.prisma.booking.findFirst({
      where: {
        propertyId: data.propertyId,
        status: { not: 'cancelled' },
        AND: [{ startDate: { lt: data.endDate } }, { endDate: { gt: data.startDate } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new ConflictException('Overlapping booking exists');
    }

    // Get settings for price calculation
    const settings = await this.settingsService.getSettings();

    // Calculate all pricing components
    const priceBreakdown = this.priceCalculator.calculate({
      startDate: data.startDate,
      endDate: data.endDate,
      baseRateLowSeason: settings.lowSeasonRate,
      baseRateHighSeason: settings.highSeasonRate,
      lowSeasonMonths: settings.lowSeasonMonths,
      hasLinens: data.hasLinens === true,
      linensPrice: data.linensPrice ?? settings.linensOptionPrice,
      hasCleaning: data.hasCleaning === true,
      cleaningPrice: data.cleaningPrice ?? settings.cleaningOptionPrice,
      discount: data.discount ?? 0,
      discountType: (data.discountType as 'amount' | 'percent' | null) ?? 'amount',
      hasCancellationInsurance: data.hasCancellationInsurance === true,
      insuranceRate: settings.cancellationInsurancePercentage,
      adults: data.adults ?? 1,
      children: data.children ?? 0,
      touristTaxRate: settings.touristTaxRatePerPersonPerDay,
    });

    // Create booking with calculated prices
    return this.prisma.booking.create({
      data: {
        startDate: data.startDate,
        endDate: data.endDate,
        propertyId: data.propertyId,
        clientId: data.clientId,
        adults: data.adults ?? 1,
        children: data.children ?? 0,
        specialRequests: data.specialRequests !== undefined ? data.specialRequests : null,
        // Store pricing details
        basePrice: priceBreakdown.basePrice,
        hasLinens: data.hasLinens === true,
        linensPrice: data.linensPrice ?? settings.linensOptionPrice,
        hasCleaning: data.hasCleaning === true,
        cleaningPrice: data.cleaningPrice ?? settings.cleaningOptionPrice,
        hasCancellationInsurance: data.hasCancellationInsurance === true,
        insuranceFee: priceBreakdown.insuranceFee,
        discount: data.discount ?? 0,
        discountType: data.discountType ?? null,
        // Calculated totals
        taxes: priceBreakdown.touristTax,
        totalPrice: priceBreakdown.totalPrice,
        // Keep cleaningFee for backward compatibility
        cleaningFee: data.hasCleaning ? (data.cleaningPrice ?? settings.cleaningOptionPrice) : 0,
      },
    });
  }

  async delete(id: string): Promise<Booking> {
    // delete dependent invoices first to avoid foreign key constraint errors
    return await this.prisma.$transaction(async (tx) => {
      await tx.invoice.deleteMany({ where: { bookingId: id } });
      return tx.booking.delete({ where: { id } });
    });
  }

  async findOne(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: { property: true, client: true, invoice: true },
    });
  }

  async update(id: string, data: UpdateBookingDto): Promise<Booking> {
    // Fetch current booking to have base values for validation
    const current = await this.prisma.booking.findUnique({ where: { id } });
    if (!current) {
      throw new BadRequestException('Booking not found');
    }

    const startDate = data.startDate ?? current.startDate;
    const endDate = data.endDate ?? current.endDate;
    const propertyId = data.propertyId ?? current.propertyId;
    const totalPrice = data.totalPrice ?? current.totalPrice;

    if (!(startDate instanceof Date) || Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start date');
    }
    if (!(endDate instanceof Date) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid end date');
    }
    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }
    if (totalPrice == null || totalPrice <= 0) {
      throw new BadRequestException('Total price must be greater than 0');
    }

    // Overlap check, excluding this booking id
    const overlap = await this.prisma.booking.findFirst({
      where: {
        propertyId,
        status: { not: 'cancelled' },
        id: { not: id },
        AND: [{ startDate: { lt: endDate } }, { endDate: { gt: startDate } }],
      },
      select: { id: true },
    });
    if (overlap) {
      throw new ConflictException('Overlapping booking exists');
    }

    const updateData: Prisma.BookingUpdateInput = {
      startDate,
      endDate,
      totalPrice,
    };

    if (typeof data.status !== 'undefined') {
      if (!isValidBookingStatus(data.status)) {
        throw new BadRequestException('Invalid status');
      }
      updateData.status = data.status;
    }

    if (typeof data.cleaningFee !== 'undefined') {
      updateData.cleaningFee = data.cleaningFee;
    }
    if (typeof data.taxes !== 'undefined') {
      updateData.taxes = data.taxes;
    }
    if (typeof data.adults !== 'undefined') {
      updateData.adults = data.adults;
    }
    if (typeof data.children !== 'undefined') {
      updateData.children = data.children;
    }
    if (typeof data.specialRequests !== 'undefined') {
      updateData.specialRequests = data.specialRequests;
    }

    // Permet la mise à jour du client et de la propriété
    if (data.propertyId && data.propertyId !== current.propertyId) {
      updateData.property = { connect: { id: data.propertyId } };
    }
    if (data.clientId && data.clientId !== current.clientId) {
      updateData.client = { connect: { id: data.clientId } };
    }

    return this.prisma.booking.update({ where: { id }, data: updateData });
  }
}
