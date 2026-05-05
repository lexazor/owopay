import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalTransactionsToday, totalDepositsPending, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.transaction.count({ where: { createdAt: { gte: today } } }),
      this.prisma.deposit.count({ where: { status: 'WAITING_VERIFICATION' } }),
      this.prisma.transaction.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalUsers,
      totalTransactionsToday,
      totalDepositsPending,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getUsers(query: any) {
    const where: any = {};
    if (query.search) {
      where.OR = [
        { fullName: { contains: query.search } },
        { email: { contains: query.search } },
        { username: { contains: query.search } },
      ];
    }
    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        username: true,
        email: true,
        whatsapp: true,
        balance: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ? parseInt(query.limit) : 50,
      skip: query.offset ? parseInt(query.offset) : 0,
    });
  }

  async updateUser(id: string, dto: any) {
    const updateData: any = {};
    if (dto.balance !== undefined) updateData.balance = dto.balance;
    if (dto.status !== undefined) updateData.status = dto.status;
    if (dto.role !== undefined) updateData.role = dto.role;
    return this.prisma.user.update({ where: { id }, data: updateData });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { providers: true } } },
    });
  }

  async createCategory(dto: any) {
    return this.prisma.category.create({ data: dto });
  }

  async updateCategory(id: string, dto: any) {
    return this.prisma.category.update({ where: { id }, data: dto });
  }

  async deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  async getProviders() {
    return this.prisma.provider.findMany({
      include: { category: { select: { name: true } }, _count: { select: { products: true } } },
    });
  }

  async createProvider(dto: any) {
    return this.prisma.provider.create({ data: dto });
  }

  async updateProvider(id: string, dto: any) {
    return this.prisma.provider.update({ where: { id }, data: dto });
  }

  async deleteProvider(id: string) {
    return this.prisma.provider.delete({ where: { id } });
  }

  async getProducts(query: any) {
    const where: any = {};
    if (query.providerId) where.providerId = query.providerId;
    return this.prisma.product.findMany({
      where,
      include: { provider: { select: { name: true, category: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProduct(dto: any) {
    return this.prisma.product.create({ data: dto });
  }

  async updateProduct(id: string, dto: any) {
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async deleteProduct(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }

  async getPaymentMethods() {
    return this.prisma.paymentMethod.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createPaymentMethod(dto: any) {
    return this.prisma.paymentMethod.create({ data: dto });
  }

  async updatePaymentMethod(id: string, dto: any) {
    return this.prisma.paymentMethod.update({ where: { id }, data: dto });
  }

  async deletePaymentMethod(id: string) {
    return this.prisma.paymentMethod.delete({ where: { id } });
  }

  async getDeposits(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.deposit.findMany({
      where,
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        paymentMethod: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ? parseInt(query.limit) : 50,
      skip: query.offset ? parseInt(query.offset) : 0,
    });
  }

  async updateDepositStatus(id: string, dto: { status: string; note?: string }) {
    // Handled by deposits service for consistency
    return { message: 'Use deposits controller' };
  }

  async getTransactions(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.transaction.findMany({
      where,
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        product: { include: { provider: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit ? parseInt(query.limit) : 50,
      skip: query.offset ? parseInt(query.offset) : 0,
    });
  }

  async updateTransactionStatus(id: string, dto: { status: string; note?: string }) {
    return { message: 'Use transactions controller' };
  }

  async getBanners() {
    return this.prisma.banner.findMany({ orderBy: { order: 'asc' } });
  }

  async createBanner(dto: any) {
    return this.prisma.banner.create({ data: dto });
  }

  async updateBanner(id: string, dto: any) {
    return this.prisma.banner.update({ where: { id }, data: dto });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
