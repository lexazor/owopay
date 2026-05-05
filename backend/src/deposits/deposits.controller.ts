import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DepositsService } from './deposits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';
import { multerOptions } from '../uploads/uploads.service';

@Controller('deposits')
export class DepositsController {
  constructor(private readonly depositsService: DepositsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: any, @Request() req: any) {
    return this.depositsService.create(req.user.userId, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req: any) {
    return this.depositsService.findByUser(req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.depositsService.findOne(id, req.user.userId);
  }

  @Post(':id/upload-proof')
  @UseGuards(JwtAuthGuard)
  async uploadProof(@Param('id') id: string, @Body() dto: { proofImage: string }) {
    return this.depositsService.uploadProof(id, dto.proofImage);
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async findAllAdmin(@Query() query: any) {
    return this.depositsService.findAllAdmin(query);
  }

  @Patch('admin/:id/status')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async updateStatus(@Param('id') id: string, @Body() dto: { status: string; note?: string }) {
    return this.depositsService.updateStatus(id, dto.status as any, dto.note);
  }
}
