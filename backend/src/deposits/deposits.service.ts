import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class DepositsService {
  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  private generateInvoice(): string {
    const prefix = 'DEP';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  async create(userId: string, dto: { paymentMethodId: string; amount: number }) {
    const method = await this.prisma.paymentMethod.findUnique({
      where: { id: dto.paymentMethodId, isActive: true },
    });
    if (!method) throw new NotFoundException('Payment method not found');

    if (dto.amount < Number(method.minAmount) || dto.amount > Number(method.maxAmount)) {
      throw new BadRequestException(`Amount must be between ${method.minAmount} and ${method.maxAmount}`);
    }

    const uniqueCode = method.uniqueCode
      ? Math.floor(Math.random() * (method.uniqueMax - method.uniqueMin + 1)) + method.uniqueMin
      : 0;
    const totalAmount = dto.amount + uniqueCode;
    const expiredAt = new Date(Date.now() + method.expiredMinutes * 60 * 1000);

    const deposit = await this.prisma.deposit.create({
      data: {
        userId,
        paymentMethodId: dto.paymentMethodId,
        invoiceNumber: this.generateInvoice(),
        amount: dto.amount,
        uniqueCode,
        totalAmount,
        expiredAt,
        status: 'PENDING',
      },
      include: { paymentMethod: true },
    });

    return deposit;
  }

  async findByUser(userId: string) {
    return this.prisma.deposit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { paymentMethod: { select: { name: true, logo: true, accountNumber: true, accountName: true } } },
    });
  }

  async findOne(id: string, userId: string) {
    const deposit = await this.prisma.deposit.findFirst({
      where: { id, userId },
      include: { paymentMethod: true },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');
    return deposit;
  }

  async uploadProof(id: string, proofImage: string) {
    const deposit = await this.prisma.deposit.findUnique({ where: { id } });
    if (!deposit) throw new NotFoundException('Deposit not found');
    if (deposit.status !== 'PENDING') throw new BadRequestException('Deposit already processed');
    if (new Date() > deposit.expiredAt) throw new BadRequestException('Deposit has expired');

    const updated = await this.prisma.deposit.update({
      where: { id },
      data: { proofImage, status: 'WAITING_VERIFICATION' },
    });

    this.events.notifyUser(deposit.userId, 'deposit.status_changed', {
      depositId: id,
      status: 'WAITING_VERIFICATION',
    });

    return updated;
  }

  async findAllAdmin(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    return this.prisma.deposit.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, username: true, email: true } },
        paymentMethod: { select: { name: true } },
      },
      take: query.limit ? parseInt(query.limit) : 50,
      skip: query.offset ? parseInt(query.offset) : 0,
    });
  }

  async updateStatus(id: string, status: 'SUCCESS' | 'FAILED', note?: string) {
    const deposit = await this.prisma.deposit.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!deposit) throw new NotFoundException('Deposit not found');

    const updated = await this.prisma.deposit.update({
      where: { id },
      data: { status, confirmedAt: status === 'SUCCESS' ? new Date() : undefined },
    });

    if (status === 'SUCCESS') {
      await this.prisma.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } },
      });
      const user = await this.prisma.user.findUnique({ where: { id: deposit.userId }, select: { balance: true } });
      this.events.notifyUser(deposit.userId, 'balance.updated', { balance: Number(user?.balance) });
    }

    this.events.notifyUser(deposit.userId, 'deposit.status_changed', {
      depositId: id,
      status,
    });

    return updated;
  }

  async expireOldDeposits() {
    const expired = await this.prisma.deposit.updateMany({
      where: {
        status: { in: ['PENDING', 'WAITING_VERIFICATION'] },
        expiredAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    const deposits = await this.prisma.deposit.findMany({
      where: {
        status: 'EXPIRED',
        updatedAt: { gte: new Date(Date.now() - 2 * 60 * 1000) },
      },
      select: { userId: true, id: true },
    });

    for (const d of deposits) {
      this.events.notifyUser(d.userId, 'deposit.expired', { depositId: d.id });
    }

    return expired.count;
  }
}
