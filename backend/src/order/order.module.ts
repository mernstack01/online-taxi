import {
  Module,
  forwardRef,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrdersGateway } from './orders.gateway';
import { AuthModule } from '../auth/auth.module';
import { DriversModule } from '../drivers/drivers.module';
import { DispatchModule } from '../dispatch/dispatch.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DriversModule,
    forwardRef(() => DispatchModule),
  ],
  controllers: [OrderController],
  providers: [
    OrderService,
    OrdersGateway
  ],
  exports: [OrdersGateway]
})
export class OrderModule {}
