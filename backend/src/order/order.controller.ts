import { Body, Controller, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../interfaces';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateOrderDto) {
    return this.orderService.create(dto, user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.orderService.findAll();
  }

  @Patch(':id/accept')
  @UseGuards(
    JwtAuthGuard,
    RolesGuard
  )
  @Roles('driver')
  acceptOrder(
    @Param('id') orderId: string,
    @CurrentUser() user: JwtUser,
  ) {
    return this.orderService.acceptOrder(
      orderId,
      user.userId,
    );
  }

  @Get('available')
  @UseGuards(JwtAuthGuard)
  availableOrders() {
    return this.orderService.availableOrders();
  }
}
