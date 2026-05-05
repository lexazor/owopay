import { IsString, IsEmail, MinLength, IsNotEmpty } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  whatsapp: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
