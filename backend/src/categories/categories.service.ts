import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { id: true, name: true, logo: true, badge: true, order: true },
    });
  }

  async findProviders(categoryId: string) {
    return this.prisma.provider.findMany({
      where: { categoryId, isActive: true },
      select: { id: true, name: true, logo: true, description: true },
    });
  }

  async create(dto: any) {
    return this.prisma.category.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
