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
import { UsersService } from '../users/users.service';
import { AddBusinessImageDto } from './dto/add-business-image.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BusinessService } from './business.service';

@Controller()
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly usersService: UsersService,
  ) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Get('businesses')
  getAllBusinesses(
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('location') location?: string,
  ) {
    return this.businessService.getAllBusinesses({ search, category, location });
  }

  @Get('admin/business')
  async adminBusinesses(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.getAdminBusinesses(user);
  }

  @Delete('admin/business/:id')
  async deleteBusinessAdmin(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.removeBusinessByAdmin(user, id);
  }

  @Post('client/business')
  async createBusiness(@Headers('authorization') authorization: string, @Body() body: CreateBusinessDto) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.createBusiness(user, body);
  }

  @Get('client/business')
  async getClientBusinesses(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.getClientBusinesses(user);
  }

  @Put('client/business/:id')
  async updateBusiness(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateBusinessDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.updateBusiness(user, id, body);
  }

  @Delete('client/business/:id')
  async deleteBusiness(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.deleteBusiness(user, id);
  }

  @Post('client/business/:id/images')
  async addBusinessImage(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: AddBusinessImageDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.addBusinessImage(user, id, body);
  }

  @Get('client/business/:id/images')
  listBusinessImages(@Param('id') id: string) {
    return this.businessService.listBusinessImages(id);
  }

  @Delete('client/images/:imageId')
  async deleteImage(
    @Headers('authorization') authorization: string,
    @Param('imageId') imageId: string,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.deleteImage(user, imageId);
  }

  @Post('client/business/:id/products')
  async createProduct(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: CreateProductDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.createProduct(user, id, body);
  }

  @Put('client/products/:id')
  async updateProduct(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.updateProduct(user, id, body);
  }

  @Delete('client/products/:id')
  async deleteProduct(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.businessService.deleteProduct(user, id);
  }

  @Get('businesses/:id/products')
  getBusinessProducts(@Param('id') id: string) {
    return this.businessService.listProductsByBusiness(id);
  }
}