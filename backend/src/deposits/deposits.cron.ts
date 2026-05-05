import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DepositsService } from './deposits.service';

@Injectable()
export class DepositsCron {
  constructor(private depositsService: DepositsService) {}

  @Cron('0 * * * * *')
  async handleExpiredDeposits() {
    await this.depositsService.expireOldDeposits();
  }
}
