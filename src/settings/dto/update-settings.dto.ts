import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  IsInt,
  Min,
  ArrayNotEmpty,
  IsIn,
} from 'class-validator';

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
  @ArrayNotEmpty()
  lowSeasonMonths?: number[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  lowSeasonRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  highSeasonRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  linensOptionPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cleaningOptionPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  touristTaxRatePerPersonPerDay?: number;

  @IsOptional()
  @IsString()
  invoicePrefix?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  invoiceDueDays?: number;

  @IsOptional()
  @IsString()
  invoicePaymentInstructions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cancellationInsurancePercentage?: number;

  @IsOptional()
  @IsString()
  cancellationInsuranceProviderName?: string;
}
