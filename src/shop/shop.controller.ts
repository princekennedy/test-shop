import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import {
  AddBusinessImageDto,
  CreateBusinessDto,
  CreateProductDto,
  UpdateBusinessDto,
  UpdateProductDto,
} from './dto/business.dto';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateOrderDto } from './dto/order.dto';
import { ShopService } from './shop.service';

@Controller()
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.shopService.register(body);
  }

  @Post('auth/login')
  login(@Body() body: LoginDto) {
    return this.shopService.login(body);
  }

  @Post('auth/logout')
  logout(@Headers('authorization') authorization?: string) {
    const token = this.getToken(authorization);
    return this.shopService.logout(token);
  }

  @Get('auth/me')
  me(@Headers('authorization') authorization?: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getMe(user);
  }

  @Post('customers')
  createCustomer(@Headers('authorization') authorization: string, @Body() body: CreateCustomerDto) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.createCustomer(user, body);
  }

  @Get('customers')
  listCustomers(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.listCustomers(user);
  }

  @Get('customers/:id')
  getCustomer(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getCustomer(user, id);
  }

  @Put('customers/:id')
  updateCustomer(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateCustomerDto,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.updateCustomer(user, id, body);
  }

  @Delete('customers/:id')
  deleteCustomer(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.deleteCustomer(user, id);
  }

  @Get('customers/:id/reservations')
  customerReservations(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getCustomerReservations(user, id);
  }

  @Get('admin/users')
  adminUsers(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getAdminUsers(user);
  }

  @Get('admin/business')
  adminBusiness(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getAdminBusinesses(user);
  }

  @Delete('admin/business/:id')
  deleteBusinessAdmin(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.removeBusinessByAdmin(user, id);
  }

  @Post('client/business')
  createBusiness(@Headers('authorization') authorization: string, @Body() body: CreateBusinessDto) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.createBusiness(user, body);
  }

  @Get('client/business')
  getClientBusiness(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getClientBusinesses(user);
  }

  @Put('client/business/:id')
  updateBusiness(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateBusinessDto,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.updateBusiness(user, id, body);
  }

  @Delete('client/business/:id')
  deleteBusiness(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.deleteBusiness(user, id);
  }

  @Post('client/business/:id/images')
  uploadImage(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: AddBusinessImageDto,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.addBusinessImage(user, id, body.imageUrl);
  }

  @Get('client/business/:id/images')
  listImages(@Param('id') id: string) {
    return this.shopService.listBusinessImages(id);
  }

  @Delete('client/images/:imageId')
  deleteImage(
    @Headers('authorization') authorization: string,
    @Param('imageId') imageId: string,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.deleteImage(user, imageId);
  }

  @Post('client/business/:id/products')
  createProduct(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: CreateProductDto,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.createProduct(user, id, body);
  }

  @Put('client/products/:id')
  updateProduct(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.updateProduct(user, id, body);
  }

  @Delete('client/products/:id')
  deleteProduct(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.deleteProduct(user, id);
  }

  @Get('businesses')
  getAllBusinesses(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.shopService.getAllBusinesses({ search, category, location });
  }

  @Get('businesses/:id/products')
  getBusinessProducts(@Param('id') id: string) {
    return this.shopService.listProductsByBusiness(id);
  }

  @Post('orders')
  createOrder(@Headers('authorization') authorization: string, @Body() body: CreateOrderDto) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.createOrder(user, body);
  }

  @Get('orders')
  listOrders(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.listOrdersForCurrentUser(user);
  }

  @Get('customer/notification')
  customerNotifications(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getCustomerNotifications(user);
  }

  @Get('client/notification')
  clientNotifications(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getClientNotifications(user);
  }

  @Get('admin/notification')
  adminNotifications(@Headers('authorization') authorization: string) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.getAdminNotifications(user);
  }

  @Put('client/notification/:id')
  markClientNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.markNotificationRead(user, id);
  }

  @Put('customer/notification/:id')
  markCustomerNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.markNotificationRead(user, id);
  }

  @Put('admin/notification/:id')
  markAdminNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
  ) {
    const user = this.shopService.getUserFromToken(this.getToken(authorization));
    return this.shopService.markNotificationRead(user, id);
  }
}