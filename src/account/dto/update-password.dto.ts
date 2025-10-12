import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @Length(8, 200)
  currentPassword!: string;

  @IsString()
  @Length(8, 200)
  newPassword!: string;
}
