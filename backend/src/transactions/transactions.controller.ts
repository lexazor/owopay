import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: any, @Request() req: any) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.transactionsService.findByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.transactionsService.findOne(id, req.user.userId);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAllAdmin(@Query() query: any) {
    return this.transactionsService.findAllAdmin(query);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: { status: string; note?: string }) {
    return this.transactionsService.updateStatus(id, dto.status as any, dto.note);
  }
}
