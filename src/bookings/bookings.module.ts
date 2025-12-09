import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InvoicesModule } from 'src/invoices/invoices.module';
import { SettingsModule } from 'src/settings/settings.module';
import { BookingPriceCalculator } from './booking-price.calculator';

@Module({
  imports: [PrismaModule, InvoicesModule, SettingsModule],
  providers: [BookingsService, BookingPriceCalculator],
  controllers: [BookingsController],
})
export class BookingsModule {}
