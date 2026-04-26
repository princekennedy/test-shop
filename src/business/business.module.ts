import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsModule } from '../notifications/notifications.module';
import { UsersModule } from '../users/users.module';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { BusinessEntity } from './entities/business.entity';
import { BusinessImageEntity } from './entities/business-image.entity';
import { ProductEntity } from './entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessEntity, BusinessImageEntity, ProductEntity]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [TypeOrmModule, BusinessService],
})
export class BusinessModule {}