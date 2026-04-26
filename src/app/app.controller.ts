import { Controller, Get, Redirect, Render } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  renderHome() {
    return {};
  }

  @Get('customer')
  @Render('customer')
  renderCustomer() {
    return {};
  }

  @Get('client')
  @Render('client')
  renderClient() {
    return {};
  }

  @Get('admin')
  @Render('admin')
  renderAdmin() {
    return {};
  }

  @Get('index.html')
  @Redirect('/')
  redirectHome() {
    return;
  }

  @Get('customer.html')
  @Redirect('/customer')
  redirectCustomer() {
    return;
  }

  @Get('client.html')
  @Redirect('/client')
  redirectClient() {
    return;
  }

  @Get('admin.html')
  @Redirect('/admin')
  redirectAdmin() {
    return;
  }

  @Get('health')
  getHealth(): { status: string; message: string } {
    return this.appService.getHealth();
  }
}