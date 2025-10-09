import { IsOptional, IsString, Length } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 300)
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
