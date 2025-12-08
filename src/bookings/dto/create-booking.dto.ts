import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsUUID,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';
import { IsAfter } from '../../common/validators/is-after.validator';

export class CreateBookingDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsAfter('startDate', { message: 'End date must be after start date' })
  endDate!: Date;

  @IsUUID()
  propertyId!: string;

  @IsUUID()
  clientId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  adults?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  children?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasLinens?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  linensPrice?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasCleaning?: boolean;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  cleaningPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsIn(['amount', 'percent'])
  @IsString()
  @IsOptional()
  discountType?: 'amount' | 'percent';

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  hasCancellationInsurance?: boolean;

  @IsString()
  @MaxLength(500)
  @IsOptional()
  specialRequests?: string;
}
