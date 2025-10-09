import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalPrice!: number;

  @IsUUID()
  propertyId!: string;

  @IsUUID()
  clientId!: string;
}
