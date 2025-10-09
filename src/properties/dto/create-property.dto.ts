import { IsOptional, IsString, Length } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @Length(1, 200)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
