import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class TransactionsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  async create(userId: string, dto: { productId: string; customerData: any; pin: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify PIN
    const bcrypt = await import('bcrypt');
    const validPin = await bcrypt.compare(dto.pin, user.pin || '');
    if (!validPin) throw new ForbiddenException('Invalid PIN');

    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: { provider: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (!product.isActive) throw new BadRequestException('Product is not active');

    if (Number(user.balance) < Number(product.price)) {
      throw new BadRequestException('Insufficient balance');
    }

    // Deduct balance
    await this.prisma.user.update({
      where: { id: userId },
      data: { balance: { decrement: product.price } },
    });

    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        productId: dto.productId,
        customerData: dto.customerData,
        amount: product.price,
        status: 'PENDING',
      },
      include: { product: { include: { provider: { include: { category: true } } } } },
    });

    this.events.notifyUser(userId, 'transaction.status_changed', {
      transactionId: transaction.id,
      status: 'PENDING',
    });
    this.events.notifyUser(userId, 'balance.updated', {
      balance: Number(user.balance) - Number(product.price),
    });

    return transaction;
  }

  async findByUser(userId: string) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { product: { include: { provider: { select: { name: true, logo: true, category: { select: { name: true } } } } } } },
    });
  }

  async findOne(id: string, userId: string) {
    const tx = await this.prisma.transaction.findFirst({
      where: { id, userId },
      include: { product: { include: { provider: { include: { category: true } } } } },
    });
    if (!tx) throw new NotFoundException('Transaction not found');
    return tx;
  }

  async findAllAdmin(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        product: { include: { provider: { select: { name: true } } } },
      },
      take: query.limit ? parseInt(query.limit) : 50,
      skip: query.offset ? parseInt(query.offset) : 0,
    });
  }

  async updateStatus(id: string, status: 'SUCCESS' | 'FAILED', note?: string) {
    const tx = await this.prisma.transaction.findUnique({ where: { id }, include: { user: true } });
    if (!tx) throw new NotFoundException('Transaction not found');

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: { status, note },
      include: { user: true, product: true },
    });

    if (status === 'FAILED') {
      // Refund balance
      await this.prisma.user.update({
        where: { id: tx.userId },
        data: { balance: { increment: tx.amount } },
      });
      const user = await this.prisma.user.findUnique({ where: { id: tx.userId }, select: { balance: true } });
      this.events.notifyUser(tx.userId, 'balance.updated', { balance: Number(user?.balance) });
    }

    this.events.notifyUser(tx.userId, 'transaction.status_changed', {
      transactionId: id,
      status,
    });

    return updated;
  }
}
