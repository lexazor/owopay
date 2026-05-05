import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { TransactionsService } from '../transactions/transactions.service';
import { DepositsService } from '../deposits/deposits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/admin.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly transactionsService: TransactionsService,
    private readonly depositsService: DepositsService,
  ) {}

  @Get('dashboard/stats')
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Patch('users/:id')
  async updateUser(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateUser(id, dto);
  }

  @Get('categories')
  async getCategories() {
    return this.adminService.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() dto: any) {
    return this.adminService.createCategory(dto);
  }

  @Patch('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.adminService.deleteCategory(id);
  }

  @Get('providers')
  async getProviders() {
    return this.adminService.getProviders();
  }

  @Post('providers')
  async createProvider(@Body() dto: any) {
    return this.adminService.createProvider(dto);
  }

  @Patch('providers/:id')
  async updateProvider(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateProvider(id, dto);
  }

  @Delete('providers/:id')
  async deleteProvider(@Param('id') id: string) {
    return this.adminService.deleteProvider(id);
  }

  @Get('products')
  async getProducts(@Query() query: any) {
    return this.adminService.getProducts(query);
  }

  @Post('products')
  async createProduct(@Body() dto: any) {
    return this.adminService.createProduct(dto);
  }

  @Patch('products/:id')
  async updateProduct(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateProduct(id, dto);
  }

  @Delete('products/:id')
  async deleteProduct(@Param('id') id: string) {
    return this.adminService.deleteProduct(id);
  }

  @Get('payment-methods')
  async getPaymentMethods() {
    return this.adminService.getPaymentMethods();
  }

  @Post('payment-methods')
  async createPaymentMethod(@Body() dto: any) {
    return this.adminService.createPaymentMethod(dto);
  }

  @Patch('payment-methods/:id')
  async updatePaymentMethod(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updatePaymentMethod(id, dto);
  }

  @Delete('payment-methods/:id')
  async deletePaymentMethod(@Param('id') id: string) {
    return this.adminService.deletePaymentMethod(id);
  }

  @Get('deposits')
  async getDeposits(@Query() query: any) {
    return this.adminService.getDeposits(query);
  }

  @Patch('deposits/:id/status')
  async updateDepositStatus(@Param('id') id: string, @Body() dto: any) {
    return this.depositsService.updateStatus(id, dto.status, dto.note);
  }

  @Get('transactions')
  async getTransactions(@Query() query: any) {
    return this.adminService.getTransactions(query);
  }

  @Patch('transactions/:id/status')
  async updateTransactionStatus(@Param('id') id: string, @Body() dto: any) {
    return this.transactionsService.updateStatus(id, dto.status, dto.note);
  }

  @Get('banners')
  async getBanners() {
    return this.adminService.getBanners();
  }

  @Post('banners')
  async createBanner(@Body() dto: any) {
    return this.adminService.createBanner(dto);
  }

  @Patch('banners/:id')
  async updateBanner(@Param('id') id: string, @Body() dto: any) {
    return this.adminService.updateBanner(id, dto);
  }

  @Delete('banners/:id')
  async deleteBanner(@Param('id') id: string) {
    return this.adminService.deleteBanner(id);
  }
}
