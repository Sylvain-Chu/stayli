import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';
import { IsAfter } from '../../common/validators/is-after.validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
  @IsOptional()
  @IsAfter('startDate', { message: 'End date must be after start date' })
  get _endAfterStart(): Date | undefined {
    return this.endDate;
  }

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalPrice?: number;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
