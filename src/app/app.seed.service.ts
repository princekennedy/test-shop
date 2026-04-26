import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessService } from '../business/business.service';
import { CreateBusinessDto } from '../business/dto/create-business.dto';
import { CreateProductDto } from '../business/dto/create-product.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AppSeedService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    private readonly usersService: UsersService,
    private readonly businessService: BusinessService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    const userCount = await this.usersRepository.count();
    if (userCount > 0) {
      return;
    }

    const admin = await this.usersService.createUser({
      username: 'Admin',
      email: 'admin@local.test',
      password: 'admin123',
      role: UserRole.ADMIN,
      location: 'HQ',
    });

    const client = await this.usersService.createUser({
      username: 'Sample Client',
      email: 'client@local.test',
      password: 'client123',
      role: UserRole.CLIENT,
      location: 'City Center',
      businessName: 'Fresh Mart',
    });

    const customer = await this.usersService.createUser({
      username: 'Sample Customer',
      email: 'customer@local.test',
      password: 'customer123',
      role: UserRole.CUSTOMER,
      location: 'Riverside',
    });

    await this.notificationsService.createForUser(
      customer.id,
      `Welcome ${customer.username}, explore businesses and place your first order.`,
    );
    await this.notificationsService.createForUser(
      client.id,
      `Welcome ${client.username}, manage your business profile and stock.`,
    );
    await this.notificationsService.createForUser(admin.id, 'Admin account initialized with sample records.');

    const business = await this.businessService.createSeedBusiness(client.id, {
      name: 'Fresh Mart',
      description: 'Daily groceries and household goods.',
      category: 'Retail',
      location: 'City Center',
      contact: '+265-999-555-100',
    } satisfies CreateBusinessDto);

    await this.businessService.createSeedProduct(business.id, {
      name: 'Rice 5kg',
      description: 'Premium local rice.',
      price: 12.5,
      stock: 30,
    } satisfies CreateProductDto);

    await this.businessService.createSeedProduct(business.id, {
      name: 'Cooking Oil 2L',
      description: 'Sunflower oil.',
      price: 8.75,
      stock: 20,
    } satisfies CreateProductDto);
  }
}