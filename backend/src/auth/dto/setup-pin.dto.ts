import { IsString, Length, Matches } from 'class-validator';

export class SetupPinDto {
  @IsString()
  @Length(6, 6)
  @Matches(/^\d{6}$/, { message: 'PIN must be exactly 6 digits' })
  pin: string;
}
