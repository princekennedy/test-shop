import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { OrdersModule } from '../orders/orders.module';
import { UsersModule } from '../users/users.module';
import { UserEntity } from '../users/entities/user.entity';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), UsersModule, OrdersModule, NotificationsModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}