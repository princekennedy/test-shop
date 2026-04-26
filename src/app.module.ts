import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app/app.controller';
import { AppSeedService } from './app/app.seed.service';
import { AppService } from './app/app.service';
import { BusinessModule } from './business/business.module';
import { CustomersModule } from './customers/customers.module';
import { NotificationsModule } from './notifications/notifications.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';

function getDatabaseOptions(): TypeOrmModuleOptions {
  const dbType = process.env.DB_TYPE ?? (process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql');

  if (dbType === 'sqlite') {
    return {
      type: 'sqlite',
      database: process.env.DB_DATABASE ?? ':memory:',
      autoLoadEntities: true,
      synchronize: true,
      dropSchema: process.env.NODE_ENV === 'test',
    };
  }

  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_DATABASE ?? 'shop_project',
    autoLoadEntities: true,
    synchronize: true,
  };
}

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: getDatabaseOptions,
    }),
    UsersModule,
    NotificationsModule,
    BusinessModule,
    OrdersModule,
    CustomersModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppSeedService],
})
export class AppModule {}
