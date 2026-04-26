import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateBusinessDto, CreateProductDto, UpdateBusinessDto, UpdateProductDto } from './dto/business.dto';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { CreateOrderDto } from './dto/order.dto';
import {
  AppNotification,
  AuthUser,
  Business,
  Order,
  OrderItem,
  Product,
  Session,
  User,
  UserRole,
} from './entities/shop.entity';

@Injectable()
export class ShopService {
  private readonly users: User[] = [];
  private readonly sessions: Session[] = [];
  private readonly businesses: Business[] = [];
  private readonly products: Product[] = [];
  private readonly orders: Order[] = [];
  private readonly notifications: AppNotification[] = [];

  constructor() {
    this.seed();
  }

  private seed(): void {
    const admin = this.createUser({
      username: 'Admin',
      email: 'admin@local.test',
      password: 'admin123',
      role: 'admin',
      location: 'HQ',
    });

    const client = this.createUser({
      username: 'Sample Client',
      email: 'client@local.test',
      password: 'client123',
      role: 'client',
      location: 'City Center',
      businessName: 'Fresh Mart',
    });

    const customer = this.createUser({
      username: 'Sample Customer',
      email: 'customer@local.test',
      password: 'customer123',
      role: 'customer',
      location: 'Riverside',
    });

    const business: Business = {
      id: randomUUID(),
      ownerId: client.id,
      name: 'Fresh Mart',
      description: 'Daily groceries and household goods.',
      category: 'Retail',
      location: 'City Center',
      contact: '+265-999-555-100',
      imageUrls: [],
    };
    this.businesses.push(business);

    this.products.push(
      {
        id: randomUUID(),
        businessId: business.id,
        name: 'Rice 5kg',
        description: 'Premium local rice.',
        price: 12.5,
        stock: 30,
      },
      {
        id: randomUUID(),
        businessId: business.id,
        name: 'Cooking Oil 2L',
        description: 'Sunflower oil.',
        price: 8.75,
        stock: 20,
      },
    );

    this.createNotification(
      customer.id,
      `Welcome ${customer.username}, explore businesses and place your first order.`,
    );
    this.createNotification(
      client.id,
      `Welcome ${client.username}, manage your business profile and stock.`,
    );
    this.createNotification(admin.id, 'Admin account initialized with sample records.');
  }

  private createUser(input: RegisterDto | (CreateCustomerDto & { role: UserRole })): User {
    const email = input.email.trim().toLowerCase();
    if (this.users.some((user) => user.email === email)) {
      throw new BadRequestException('Email already exists');
    }

    const user: User = {
      id: randomUUID(),
      username: input.username.trim(),
      email,
      password: input.password,
      role: input.role,
      location: input.location?.trim(),
      businessName: 'businessName' in input ? input.businessName?.trim() : undefined,
    };

    this.users.push(user);
    return user;
  }

  private toAuthUser(user: User): AuthUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      location: user.location,
      businessName: user.businessName,
    };
  }

  private createSession(userId: string): Session {
    const session: Session = {
      token: randomUUID(),
      userId,
    };
    this.sessions.push(session);
    return session;
  }

  private createNotification(userId: string, message: string): AppNotification {
    const notification: AppNotification = {
      id: randomUUID(),
      userId,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.push(notification);
    return notification;
  }

  private getUserById(userId: string): User {
    const user = this.users.find((candidate) => candidate.id === userId);
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    return user;
  }

  private requireRole(user: User, roles: UserRole[]): void {
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  getUserFromToken(token?: string): User {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const session = this.sessions.find((candidate) => candidate.token === token);
    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }

    return this.getUserById(session.userId);
  }

  register(input: RegisterDto): { token: string; user: AuthUser } {
    if (!input.username || !input.email || !input.password || !input.role) {
      throw new BadRequestException('username, email, password and role are required');
    }

    if (!['customer', 'client'].includes(input.role)) {
      throw new BadRequestException('Role can only be customer or client');
    }

    const user = this.createUser(input);
    const session = this.createSession(user.id);

    if (user.role === 'client' && user.businessName) {
      this.businesses.push({
        id: randomUUID(),
        ownerId: user.id,
        name: user.businessName,
        description: `${user.businessName} profile created.`,
        category: 'General',
        location: user.location ?? 'Unknown',
        contact: user.email,
        imageUrls: [],
      });
    }

    this.createNotification(user.id, `Welcome ${user.username}, your account is ready.`);

    return {
      token: session.token,
      user: this.toAuthUser(user),
    };
  }

  login(input: LoginDto): { token: string; user: AuthUser } {
    if (!input.email || !input.password) {
      throw new BadRequestException('email and password are required');
    }

    const email = input.email.trim().toLowerCase();
    const user = this.users.find(
      (candidate) => candidate.email === email && candidate.password === input.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = this.createSession(user.id);
    this.createNotification(user.id, 'Successful login.');

    return {
      token: session.token,
      user: this.toAuthUser(user),
    };
  }

  logout(token: string): { message: string } {
    const index = this.sessions.findIndex((session) => session.token === token);
    if (index >= 0) {
      this.sessions.splice(index, 1);
    }
    return { message: 'Logged out successfully' };
  }

  getMe(user: User): AuthUser {
    return this.toAuthUser(user);
  }

  createCustomer(
    currentUser: User,
    input: CreateCustomerDto,
  ): { id: string; username: string; email: string; location?: string } {
    this.requireRole(currentUser, ['admin']);
    const user = this.createUser({
      ...input,
      role: 'customer',
    });
    this.createNotification(user.id, 'Your customer profile has been created by admin.');
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      location: user.location,
    };
  }

  listCustomers(currentUser: User): AuthUser[] {
    this.requireRole(currentUser, ['admin']);
    return this.users
      .filter((user) => user.role === 'customer')
      .map((customer) => this.toAuthUser(customer));
  }

  getCustomer(currentUser: User, customerId: string): AuthUser {
    const customer = this.users.find(
      (candidate) => candidate.id === customerId && candidate.role === 'customer',
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== customer.id) {
      throw new ForbiddenException('You can only access your own profile');
    }

    return this.toAuthUser(customer);
  }

  updateCustomer(currentUser: User, customerId: string, input: UpdateCustomerDto): AuthUser {
    const customer = this.users.find(
      (candidate) => candidate.id === customerId && candidate.role === 'customer',
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== customer.id) {
      throw new ForbiddenException('You can only update your own profile');
    }

    if (input.email) {
      const email = input.email.trim().toLowerCase();
      const conflict = this.users.find(
        (candidate) => candidate.email === email && candidate.id !== customer.id,
      );
      if (conflict) {
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

    this.createNotification(customer.id, 'Your profile was updated.');
    return this.toAuthUser(customer);
  }

  deleteCustomer(currentUser: User, customerId: string): { message: string } {
    this.requireRole(currentUser, ['admin']);
    const index = this.users.findIndex(
      (candidate) => candidate.id === customerId && candidate.role === 'customer',
    );

    if (index < 0) {
      throw new NotFoundException('Customer not found');
    }

    const [removed] = this.users.splice(index, 1);
    this.createNotification(currentUser.id, `Customer ${removed.email} removed.`);

    return { message: 'Customer deleted' };
  }

  getCustomerReservations(currentUser: User, customerId: string): Order[] {
    const customer = this.users.find(
      (candidate) => candidate.id === customerId && candidate.role === 'customer',
    );

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    if (currentUser.role !== 'admin' && currentUser.id !== customer.id) {
      throw new ForbiddenException('You can only view your own reservations');
    }

    return this.orders.filter((order) => order.customerId === customer.id);
  }

  getAdminUsers(currentUser: User): AuthUser[] {
    this.requireRole(currentUser, ['admin']);
    return this.users.map((user) => this.toAuthUser(user));
  }

  getAdminBusinesses(currentUser: User): Business[] {
    this.requireRole(currentUser, ['admin']);
    return this.businesses;
  }

  removeBusinessByAdmin(currentUser: User, businessId: string): { message: string } {
    this.requireRole(currentUser, ['admin']);
    const index = this.businesses.findIndex((business) => business.id === businessId);

    if (index < 0) {
      throw new NotFoundException('Business not found');
    }

    const [business] = this.businesses.splice(index, 1);
    this.createNotification(business.ownerId, `Your business ${business.name} was removed by admin.`);

    return { message: 'Business removed' };
  }

  createBusiness(currentUser: User, input: CreateBusinessDto): Business {
    this.requireRole(currentUser, ['client']);

    if (!input.name || !input.description || !input.category || !input.location || !input.contact) {
      throw new BadRequestException('All business fields are required');
    }

    const business: Business = {
      id: randomUUID(),
      ownerId: currentUser.id,
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      location: input.location.trim(),
      contact: input.contact.trim(),
      imageUrls: [],
    };

    this.businesses.push(business);
    this.createNotification(currentUser.id, `Business ${business.name} created.`);
    return business;
  }

  getClientBusinesses(currentUser: User): Business[] {
    this.requireRole(currentUser, ['client']);
    return this.businesses.filter((business) => business.ownerId === currentUser.id);
  }

  getAllBusinesses(query: { search?: string; category?: string; location?: string }): Business[] {
    const search = query.search?.trim().toLowerCase();
    const category = query.category?.trim().toLowerCase();
    const location = query.location?.trim().toLowerCase();

    return this.businesses.filter((business) => {
      const matchesSearch =
        !search ||
        business.name.toLowerCase().includes(search) ||
        business.description.toLowerCase().includes(search);
      const matchesCategory = !category || business.category.toLowerCase().includes(category);
      const matchesLocation = !location || business.location.toLowerCase().includes(location);
      return matchesSearch && matchesCategory && matchesLocation;
    });
  }

  updateBusiness(currentUser: User, businessId: string, input: UpdateBusinessDto): Business {
    const business = this.businesses.find((candidate) => candidate.id === businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (currentUser.role !== 'admin' && business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own business');
    }

    if (input.name) {
      business.name = input.name.trim();
    }
    if (input.description) {
      business.description = input.description.trim();
    }
    if (input.category) {
      business.category = input.category.trim();
    }
    if (input.location) {
      business.location = input.location.trim();
    }
    if (input.contact) {
      business.contact = input.contact.trim();
    }

    this.createNotification(business.ownerId, `Business ${business.name} was updated.`);
    return business;
  }

  deleteBusiness(currentUser: User, businessId: string): { message: string } {
    const index = this.businesses.findIndex((business) => business.id === businessId);
    if (index < 0) {
      throw new NotFoundException('Business not found');
    }

    const business = this.businesses[index];
    if (currentUser.role !== 'admin' && business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own business');
    }

    this.businesses.splice(index, 1);
    this.createNotification(business.ownerId, `Business ${business.name} deleted.`);
    return { message: 'Business deleted' };
  }

  addBusinessImage(currentUser: User, businessId: string, imageUrl: string): Business {
    const business = this.businesses.find((candidate) => candidate.id === businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own business images');
    }

    if (!imageUrl?.trim()) {
      throw new BadRequestException('imageUrl is required');
    }

    business.imageUrls.push(imageUrl.trim());
    return business;
  }

  listBusinessImages(businessId: string): string[] {
    const business = this.businesses.find((candidate) => candidate.id === businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business.imageUrls;
  }

  deleteImage(currentUser: User, imageId: string): { message: string } {
    this.requireRole(currentUser, ['client']);
    for (const business of this.businesses) {
      if (business.ownerId !== currentUser.id) {
        continue;
      }
      const index = business.imageUrls.findIndex((url) => url === imageId);
      if (index >= 0) {
        business.imageUrls.splice(index, 1);
        return { message: 'Image deleted' };
      }
    }
    throw new NotFoundException('Image not found');
  }

  createProduct(currentUser: User, businessId: string, input: CreateProductDto): Product {
    const business = this.businesses.find((candidate) => candidate.id === businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own business stock');
    }

    if (!input.name || Number.isNaN(Number(input.price)) || Number.isNaN(Number(input.stock))) {
      throw new BadRequestException('name, price and stock are required');
    }

    const product: Product = {
      id: randomUUID(),
      businessId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      price: Number(input.price),
      stock: Number(input.stock),
    };

    this.products.push(product);
    this.createNotification(currentUser.id, `New stock item added: ${product.name}.`);
    return product;
  }

  updateProduct(currentUser: User, productId: string, input: UpdateProductDto): Product {
    const product = this.products.find((candidate) => candidate.id === productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const business = this.businesses.find((candidate) => candidate.id === product.businessId);
    if (!business || business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    if (input.name) {
      product.name = input.name.trim();
    }
    if (input.description !== undefined) {
      product.description = input.description.trim();
    }
    if (input.price !== undefined) {
      product.price = Number(input.price);
    }
    if (input.stock !== undefined) {
      product.stock = Number(input.stock);
    }

    return product;
  }

  deleteProduct(currentUser: User, productId: string): { message: string } {
    const index = this.products.findIndex((candidate) => candidate.id === productId);
    if (index < 0) {
      throw new NotFoundException('Product not found');
    }

    const product = this.products[index];
    const business = this.businesses.find((candidate) => candidate.id === product.businessId);
    if (!business || business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    this.products.splice(index, 1);
    return { message: 'Product deleted' };
  }

  listProductsByBusiness(businessId: string): Product[] {
    return this.products.filter((product) => product.businessId === businessId);
  }

  createOrder(currentUser: User, input: CreateOrderDto): Order {
    this.requireRole(currentUser, ['customer']);

    if (!input.businessId || !Array.isArray(input.items) || input.items.length === 0) {
      throw new BadRequestException('businessId and items are required');
    }

    const business = this.businesses.find((candidate) => candidate.id === input.businessId);
    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const orderItems: OrderItem[] = [];
    let total = 0;

    for (const item of input.items) {
      const product = this.products.find(
        (candidate) => candidate.id === item.productId && candidate.businessId === input.businessId,
      );
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (item.quantity <= 0 || Number.isNaN(Number(item.quantity))) {
        throw new BadRequestException('Quantity must be greater than 0');
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Not enough stock for ${product.name}`);
      }

      product.stock -= item.quantity;
      const normalizedQuantity = Number(item.quantity);
      orderItems.push({
        productId: product.id,
        quantity: normalizedQuantity,
        unitPrice: product.price,
      });
      total += product.price * normalizedQuantity;
    }

    const order: Order = {
      id: randomUUID(),
      customerId: currentUser.id,
      businessId: input.businessId,
      items: orderItems,
      total,
      createdAt: new Date().toISOString(),
    };

    this.orders.push(order);

    this.createNotification(
      currentUser.id,
      `Order placed successfully. Total: ${total.toFixed(2)}.`,
    );
    this.createNotification(
      business.ownerId,
      `New order received from ${currentUser.username} for ${total.toFixed(2)}.`,
    );

    return order;
  }

  listOrdersForCurrentUser(currentUser: User): Order[] {
    if (currentUser.role === 'customer') {
      return this.orders.filter((order) => order.customerId === currentUser.id);
    }

    if (currentUser.role === 'client') {
      const businessIds = this.businesses
        .filter((business) => business.ownerId === currentUser.id)
        .map((business) => business.id);
      return this.orders.filter((order) => businessIds.includes(order.businessId));
    }

    return this.orders;
  }

  getCustomerNotifications(currentUser: User): AppNotification[] {
    this.requireRole(currentUser, ['customer']);
    return this.notifications
      .filter((notification) => notification.userId === currentUser.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  getClientNotifications(currentUser: User): AppNotification[] {
    this.requireRole(currentUser, ['client']);
    return this.notifications
      .filter((notification) => notification.userId === currentUser.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  getAdminNotifications(currentUser: User): AppNotification[] {
    this.requireRole(currentUser, ['admin']);
    return this.notifications
      .filter((notification) => notification.userId === currentUser.id)
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  }

  markNotificationRead(currentUser: User, notificationId: string): AppNotification {
    const notification = this.notifications.find((entry) => entry.id === notificationId);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own notifications');
    }

    notification.read = true;
    return notification;
  }
}