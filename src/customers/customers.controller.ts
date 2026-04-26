import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomersService } from './customers.service';

@Controller()
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly usersService: UsersService,
  ) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Post('customers')
  async createCustomer(@Headers('authorization') authorization: string, @Body() body: CreateCustomerDto) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.createCustomer(user, body);
  }

  @Get('customers')
  async listCustomers(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.listCustomers(user);
  }

  @Get('customers/:id')
  async getCustomer(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.getCustomer(user, id);
  }

  @Put('customers/:id')
  async updateCustomer(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.updateCustomer(user, id, body);
  }

  @Delete('customers/:id')
  async deleteCustomer(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.deleteCustomer(user, id);
  }

  @Get('customers/:id/reservations')
  async customerReservations(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.customersService.getCustomerReservations(user, id);
  }
}