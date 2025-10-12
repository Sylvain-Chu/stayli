import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsUUID } from 'class-validator';
import { IsAfter } from '../../common/validators/is-after.validator';

export class CreateBookingDto {
  @Type(() => Date)
  @IsDate()
  startDate!: Date;

  @Type(() => Date)
  @IsDate()
  endDate!: Date;
  @IsAfter('startDate', { message: 'End date must be after start date' })
  get _endAfterStart(): Date {
    return this.endDate;
  }

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  totalPrice!: number;

  @IsUUID()
  propertyId!: string;

  @IsUUID()
  clientId!: string;
}
