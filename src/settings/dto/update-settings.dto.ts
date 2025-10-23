import { IsString, IsOptional, IsNumber, IsArray, IsInt, Min, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  companyAddress?: string;

  @IsOptional()
  @IsString()
  companyPhoneNumber?: string;

  @IsOptional()
  @IsString()
  companyEmail?: string;

  @IsOptional()
  @IsString()
  companyLogoUrl?: string;

  @IsOptional()
  @IsIn(['en', 'fr'])
  defaultLanguage?: string;

  @IsOptional()
  @IsString()
  currencyCode?: string;

  @IsOptional()
  @IsString()
  currencySymbol?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Transform(({ value }) => {
    // Handle form data: can be a single string, array of strings, or already numbers
    if (!value) return [];
    const arr = Array.isArray(value) ? value : [value];
    return arr.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
  })
  lowSeasonMonths?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  lowSeasonRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  highSeasonRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  linensOptionPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cleaningOptionPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  touristTaxRatePerPersonPerDay?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  invoiceDueDays?: number;

  @IsOptional()
  @IsString()
  invoicePaymentInstructions?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cancellationInsurancePercentage?: number;

  @IsOptional()
  @IsString()
  cancellationInsuranceProviderName?: string;
}
