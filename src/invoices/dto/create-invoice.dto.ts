import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @Type(() => Date)
  @IsDate()
  dueDate!: Date;

  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsUUID()
  bookingId!: string;
}
