import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProvidersService {
  constructor(private prisma: PrismaService) {}

  async findProducts(providerId: string) {
    return this.prisma.product.findMany({
      where: { providerId, isActive: true },
      select: { id: true, name: true, nominal: true, price: true, badge: true },
    });
  }

  async getFormFields(providerId: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: providerId },
      select: { formFields: true },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }
    return provider.formFields;
  }

  async create(dto: any) {
    return this.prisma.provider.create({ data: dto });
  }

  async update(id: string, dto: any) {
    return this.prisma.provider.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    return this.prisma.provider.delete({ where: { id } });
  }
}
