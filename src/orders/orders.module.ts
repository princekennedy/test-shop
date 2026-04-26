import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessModule } from '../business/business.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]), BusinessModule, UsersModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [TypeOrmModule, OrdersService],
})
export class OrdersModule {}