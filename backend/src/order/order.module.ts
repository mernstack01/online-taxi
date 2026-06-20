import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersGateway } from './orders.gateway';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [PrismaModule, AuthModule, CommonModule],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrdersGateway
  ],
  exports: [OrdersGateway]
})
export class OrderModule {}
