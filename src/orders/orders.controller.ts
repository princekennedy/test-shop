import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';

@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Post('orders')
  async createOrder(@Headers('authorization') authorization: string, @Body() body: CreateOrderDto) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.ordersService.createOrder(user, body);
  }

  @Get('orders')
  async listOrders(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.ordersService.listOrdersForCurrentUser(user);
  }
}