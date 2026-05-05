import { IsString, Length, Matches } from 'class-validator';

export class VerifyPinDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}
