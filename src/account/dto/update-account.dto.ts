import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAccountDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
