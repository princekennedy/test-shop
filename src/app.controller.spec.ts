import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app/app.controller';
import { AppService } from './app/app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a health payload', () => {
      expect(appController.getHealth()).toEqual({
        status: 'ok',
        message: 'Shop API is running',
      });
    });
  });
});
