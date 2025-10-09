import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsPositive, IsString, IsUUID } from 'class-validator';

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
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalPrice?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  propertyId?: string;

  @IsOptional()
  @IsUUID()
  clientId?: string;
}
