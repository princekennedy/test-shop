import { Module } from '@nestjs/common';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';
import { ShopModule } from './shop/shop.module';

@Module({
  imports: [ShopModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
