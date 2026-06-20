import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersGateway } from './orders.gateway';
import { DispatchService } from '../dispatch/dispatch.service';

@Injectable()
export class OrderService {
  constructor(
    private prisma: PrismaService,
    private gateway: OrdersGateway,

    @Inject(forwardRef(() => DispatchService))
    private dispatch: DispatchService,
  ) { }

  async create(dto: CreateOrderDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const order = await this.prisma.order.create({
      data: {
        from: dto.from,
        to: dto.to,
        pickupLat: dto.pickupLat,
        pickupLng: dto.pickupLng,
        userId,
      },
      include: {
        user: true,
      },
    });

    await this.dispatch.dispatchOrder(order);
      
    return order;
  }

  findAll() {
    return this.prisma.order.findMany({
      include: {
        user: true,
      },
    });
  }

  async availableOrders() {
    return this.prisma.order.findMany({
      where: {
        status: 'pending',
      },
    });
  }

  async acceptOrder(
    orderId: string,
    driverId: string,
  ) {
    const order =
      await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        select: {
          userId: true,
        },
      });

    if (!order) {
      throw new NotFoundException(
        'Order not found',
      );
    }

    const result =
      await this.prisma.order.updateMany({
        where: {
          id: orderId,
          status: 'pending',
        },
        data: {
          status: 'accepted',
          driverId,
        },
      });

    if (result.count === 0) {
      throw new BadRequestException(
        'Order already taken',
      );
    }

    const updatedOrder =
      await this.prisma.order.findUnique({
        where: {
          id: orderId,
        },
        include: {
          user: true,
        },
      });

    const driverIds =
      this.dispatch
        .getDispatchedDriverIds(orderId)
        .filter(
          (id) => id !== driverId,
        );

    this.gateway.server
      .to(`user_${order.userId}`)
      .emit('orderAccepted', {
        orderId,
        driverId,
      });

    this.dispatch.cancelOrder(
      orderId,
      driverIds,
    );

    return updatedOrder;
  }
}
