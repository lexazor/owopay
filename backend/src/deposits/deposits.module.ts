import { Module } from '@nestjs/common';
import { DepositsService } from './deposits.service';
import { DepositsController } from './deposits.controller';
import { DepositsCron } from './deposits.cron';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [EventsModule],
  controllers: [DepositsController],
  providers: [DepositsService, DepositsCron],
  exports: [DepositsService],
})
export class DepositsModule {}
