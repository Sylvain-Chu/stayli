import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  IsUUID,
} from 'class-validator';

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  invoiceNumber?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dueDate?: Date;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsUUID()
  bookingId?: string;
}
