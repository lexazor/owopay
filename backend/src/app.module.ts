import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ProvidersModule } from './providers/providers.module';
import { TransactionsModule } from './transactions/transactions.module';
import { DepositsModule } from './deposits/deposits.module';
import { AdminModule } from './admin/admin.module';
import { EventsModule } from './events/events.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ProvidersModule,
    TransactionsModule,
    DepositsModule,
    AdminModule,
    EventsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
