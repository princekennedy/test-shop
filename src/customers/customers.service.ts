import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { OrdersService } from '../orders/orders.service';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly ordersService: OrdersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private toCustomer(user: UserEntity) {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      location: user.location,
      businessName: user.businessName,
    };
  }

  async createCustomer(currentUser: UserEntity, input: CreateCustomerDto) {
    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    const user = await this.usersService.createUser({
      ...input,
      role: UserRole.CUSTOMER,
    });
    await this.notificationsService.createForUser(user.id, 'Your customer profile has been created by admin.');
    return this.toCustomer(user);
  }

  async listCustomers(currentUser: UserEntity) {
    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    const customers = await this.usersRepository.find({
      where: { role: UserRole.CUSTOMER },
      order: { createdAt: 'ASC' },
    });
    return customers.map((customer) => this.toCustomer(customer));
  }

  async getCustomer(currentUser: UserEntity, customerId: string) {
    const customer = await this.usersRepository.findOne({
      where: { id: customerId, role: UserRole.CUSTOMER },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== customer.id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.toCustomer(customer);
  }

  async updateCustomer(currentUser: UserEntity, customerId: string, input: UpdateCustomerDto) {
    const customer = await this.usersRepository.findOne({
      where: { id: customerId, role: UserRole.CUSTOMER },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== customer.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (input.email) {
      const email = input.email.trim().toLowerCase();
      const conflict = await this.usersRepository.findOne({ where: { email } });
      if (conflict && conflict.id !== customer.id) {
        throw new BadRequestException('Email already in use');
      }
      customer.email = email;
    }

    if (input.username) {
      customer.username = input.username.trim();
    }
    if (input.location !== undefined) {
      customer.location = input.location.trim();
    }
    if (input.password) {
      customer.password = input.password;
    }

    const saved = await this.usersRepository.save(customer);
    await this.notificationsService.createForUser(saved.id, 'Your profile was updated.');
    return this.toCustomer(saved);
  }

  async deleteCustomer(currentUser: UserEntity, customerId: string) {
    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    const customer = await this.usersRepository.findOne({
      where: { id: customerId, role: UserRole.CUSTOMER },
    });
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    await this.usersRepository.delete({ id: customer.id });
    await this.notificationsService.createForUser(currentUser.id, `Customer ${customer.email} removed.`);
    return { message: 'Customer deleted' };
  }

  async getCustomerReservations(currentUser: UserEntity, customerId: string) {
    return this.ordersService.listCustomerReservations(currentUser, customerId);
  }
}