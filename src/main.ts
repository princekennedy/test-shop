import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.setBaseViewsDir(join(__dirname, '..', 'frontend', 'views'));
  app.setViewEngine('ejs');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'css'), { prefix: '/css' });
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'js'), { prefix: '/js' });
  app.useStaticAssets(join(__dirname, '..', 'frontend', 'images'), { prefix: '/images' });
  app.setGlobalPrefix('api/v1', {
    exclude: [
      { path: '', method: RequestMethod.GET },
      { path: 'health', method: RequestMethod.GET },
      { path: 'customer', method: RequestMethod.GET },
      { path: 'client', method: RequestMethod.GET },
      { path: 'admin', method: RequestMethod.GET },
      { path: 'index.html', method: RequestMethod.GET },
      { path: 'customer.html', method: RequestMethod.GET },
      { path: 'client.html', method: RequestMethod.GET },
      { path: 'admin.html', method: RequestMethod.GET },
    ],
  });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
