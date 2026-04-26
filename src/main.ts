import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'frontend'));
  app.setGlobalPrefix('api/v1');
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
