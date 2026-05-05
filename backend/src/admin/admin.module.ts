import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TransactionsModule } from '../transactions/transactions.module';
import { DepositsModule } from '../deposits/deposits.module';

@Module({
  imports: [TransactionsModule, DepositsModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
