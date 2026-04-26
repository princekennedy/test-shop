import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { BusinessService } from '../business/business.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly ordersRepository: Repository<OrderEntity>,
    @InjectRepository(OrderItemEntity)
    private readonly orderItemsRepository: Repository<OrderItemEntity>,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
    private readonly businessService: BusinessService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async mapOrder(order: OrderEntity) {
    const fullOrder = await this.ordersRepository.findOne({
      where: { id: order.id },
      relations: { items: true },
    });

    if (!fullOrder) {
      throw new NotFoundException('Order not found');
    }

    return fullOrder;
  }

  async createOrder(currentUser: UserEntity, input: CreateOrderDto) {
    this.usersService.ensureRole(currentUser, [UserRole.CUSTOMER]);

    if (!input.items?.length) {
      throw new BadRequestException('businessId and items are required');
    }

    return this.dataSource.transaction(async (manager) => {
      const business = await this.businessService.getOwnedBusinessOrPublic(input.businessId);

      let total = 0;
      const items: OrderItemEntity[] = [];

      for (const item of input.items) {
        const product = await this.businessService.getProductForBusiness(item.productId, input.businessId);
        if (product.stock < Number(item.quantity)) {
          throw new BadRequestException(`Not enough stock for ${product.name}`);
        }

        product.stock -= Number(item.quantity);
        await manager.save(product);

        total += Number(product.price) * Number(item.quantity);
        items.push(
          this.orderItemsRepository.create({
            productId: product.id,
            quantity: Number(item.quantity),
            unitPrice: Number(product.price),
          }),
        );
      }

      const order = manager.create(OrderEntity, {
        customerId: currentUser.id,
        businessId: business.id,
        total,
        items,
      });

      const savedOrder = await manager.save(order);
      await this.notificationsService.createForUser(
        currentUser.id,
        `Order placed successfully. Total: ${Number(total).toFixed(2)}.`,
      );
      await this.notificationsService.createForUser(
        business.ownerId,
        `New order received from ${currentUser.username} for ${Number(total).toFixed(2)}.`,
      );

      return this.mapOrder(savedOrder);
    });
  }

  async listOrdersForCurrentUser(currentUser: UserEntity) {
    if (currentUser.role === UserRole.CUSTOMER) {
      return this.ordersRepository.find({
        where: { customerId: currentUser.id },
        relations: { items: true },
        order: { createdAt: 'DESC' },
      });
    }

    if (currentUser.role === UserRole.CLIENT) {
      const businesses = await this.businessService.getClientBusinesses(currentUser);
      const businessIds = businesses.map((business) => business.id);
      if (!businessIds.length) {
        return [];
      }
      return this.ordersRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.items', 'items')
        .where('order.businessId IN (:...businessIds)', { businessIds })
        .orderBy('order.createdAt', 'DESC')
        .getMany();
    }

    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    return this.ordersRepository.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }

  async listCustomerReservations(currentUser: UserEntity, customerId: string) {
    const customer = await this.usersService.findUserById(customerId);
    if (customer.role !== UserRole.CUSTOMER) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== UserRole.ADMIN && currentUser.id !== customer.id) {
      throw new NotFoundException('You can only view your own reservations');
    }

    return this.ordersRepository.find({
      where: { customerId: customer.id },
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });
  }
}