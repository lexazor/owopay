import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get('banners')
  async getBanners() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
  }

  @Get(':id/providers')
  async findProviders(@Param('id') id: string) {
    return this.categoriesService.findProviders(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  async create(@Body() dto: any) {
    return this.categoriesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
