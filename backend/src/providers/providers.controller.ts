import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ProvidersService } from './providers.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';

@Controller('providers')
export class ProvidersController {
  constructor(
    private readonly providersService: ProvidersService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('payment-methods')
  async findPaymentMethods() {
    return this.prisma.paymentMethod.findMany({
      where: { isActive: true },
      select: { id: true, name: true, logo: true, accountNumber: true, accountName: true, minAmount: true, maxAmount: true, expiredMinutes: true },
    });
  }

  @Get('products/all')
  async findAllProducts(@Query() query: any) {
    return this.prisma.product.findMany({
      where: { isActive: true, ...(query.providerId ? { providerId: query.providerId } : {}) },
      include: { provider: { select: { name: true, category: { select: { name: true } } } } },
    });
  }

  @Get(':id/products')
  async findProducts(@Param('id') id: string) {
    return this.providersService.findProducts(id);
  }

  @Get(':id/form-fields')
  async getFormFields(@Param('id') id: string) {
    return this.providersService.getFormFields(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() dto: any) {
    return this.providersService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.providersService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    return this.providersService.remove(id);
  }
}
