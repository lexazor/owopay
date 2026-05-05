import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  private generateUsername(fullName: string): string {
    const base = fullName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '.');
    return base;
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { whatsapp: dto.whatsapp }] },
    });
    if (existing) {
      throw new ConflictException('Email or WhatsApp already registered');
    }

    let username = this.generateUsername(dto.fullName);
    let suffix = 1;
    let finalUsername = username;
    while (await this.prisma.user.findUnique({ where: { username: finalUsername } })) {
      finalUsername = `${username}${suffix}`;
      suffix++;
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        username: finalUsername,
        whatsapp: dto.whatsapp,
        email: dto.email,
        password: hashedPassword,
      },
      select: { id: true, fullName: true, username: true, email: true, whatsapp: true, role: true, isPinSet: true },
    });

    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    return { user, token };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.identifier }, { whatsapp: dto.identifier }],
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'BANNED') {
      throw new ForbiddenException('Account has been banned');
    }

    const token = this.jwtService.sign({ userId: user.id, role: user.role });
    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        whatsapp: user.whatsapp,
        role: user.role,
        isPinSet: user.isPinSet,
        balance: user.balance,
      },
    };
  }

  async setupPin(userId: string, pin: string) {
    const hashedPin = await bcrypt.hash(pin, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { pin: hashedPin, isPinSet: true, pinAttempts: 0, pinLockedAt: null },
    });
    return { message: 'PIN set successfully' };
  }

  async verifyPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.pinLockedAt && new Date().getTime() - user.pinLockedAt.getTime() < 30 * 60 * 1000) {
      throw new ForbiddenException('PIN is locked. Please try again after 30 minutes.');
    }

    const valid = await bcrypt.compare(pin, user.pin || '');
    if (!valid) {
      const attempts = user.pinAttempts + 1;
      const updateData: any = { pinAttempts: attempts };
      if (attempts >= 5) {
        updateData.pinLockedAt = new Date();
      }
      await this.prisma.user.update({ where: { id: userId }, data: updateData });
      throw new UnauthorizedException(`Invalid PIN. ${5 - attempts} attempts remaining.`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { pinAttempts: 0, pinLockedAt: null },
    });

    return { verified: true };
  }

  async forgotPin(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { message: 'If this email exists, a reset link would be sent.' };
    }
    // In production, send email with reset token
    return { message: 'PIN reset instructions sent to your email.' };
  }
}
