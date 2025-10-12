import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { IsAfter } from '../../common/validators/is-after.validator';

export class CreateBookingDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  @IsAfter('startDate', { message: 'End date must be after start date' })
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
