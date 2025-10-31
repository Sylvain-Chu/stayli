import { Type, Transform } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  IsString,
  Min,
  MaxLength,
} from 'class-validator';
import { IsAfter } from '../../common/validators/is-after.validator';
import { BookingStatus } from '@prisma/client';

export class UpdateBookingDto {
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @IsOptional()
  @IsAfter('startDate', { message: 'End date must be after start date' })
  get _endAfterStart(): Date | undefined {
    return this.endDate;
  }

  @IsOptional()
  @Transform(({ value }) =>
    Array.isArray(value) ? Number(value[0]) : value === '' ? undefined : Number(value),
  )
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  totalPrice?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cleaningFee?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  taxes?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsUUID()
  clientId?: string;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  adults?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  children?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @MaxLength(255)
  specialRequests?: string;
}
