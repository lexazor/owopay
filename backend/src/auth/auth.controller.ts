import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SetupPinDto } from './dto/setup-pin.dto';
import { VerifyPinDto } from './dto/verify-pin.dto';
import { ForgotPinDto } from './dto/forgot-pin.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('setup-pin')
  @UseGuards(JwtAuthGuard)
  async setupPin(@Body() dto: SetupPinDto, @Request() req: any) {
    return this.authService.setupPin(req.user.userId, dto.pin);
  }

  @Post('verify-pin')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async verifyPin(@Body() dto: VerifyPinDto, @Request() req: any) {
    return this.authService.verifyPin(req.user.userId, dto.pin);
  }

  @Post('forgot-pin')
  @HttpCode(HttpStatus.OK)
  async forgotPin(@Body() dto: ForgotPinDto) {
    return this.authService.forgotPin(dto.email);
  }
}
