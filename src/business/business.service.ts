import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { UsersService } from '../users/users.service';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { AddBusinessImageDto } from './dto/add-business-image.dto';
import { CreateBusinessDto } from './dto/create-business.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BusinessEntity } from './entities/business.entity';
import { BusinessImageEntity } from './entities/business-image.entity';
import { ProductEntity } from './entities/product.entity';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(BusinessEntity)
    private readonly businessesRepository: Repository<BusinessEntity>,
    @InjectRepository(BusinessImageEntity)
    private readonly businessImagesRepository: Repository<BusinessImageEntity>,
    @InjectRepository(ProductEntity)
    private readonly productsRepository: Repository<ProductEntity>,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  private async findBusinessOrFail(id: string): Promise<BusinessEntity> {
    const business = await this.businessesRepository.findOne({
      where: { id },
      relations: { images: true },
    });
    if (!business) {
      throw new NotFoundException('Business not found');
    }
    return business;
  }

  async getAllBusinesses(query: { search?: string; category?: string; location?: string }) {
    const qb = this.businessesRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.images', 'image')
      .orderBy('business.createdAt', 'DESC');

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(business.name) LIKE :search OR LOWER(business.description) LIKE :search)', {
        search: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    if (query.category?.trim()) {
      qb.andWhere('LOWER(business.category) LIKE :category', {
        category: `%${query.category.trim().toLowerCase()}%`,
      });
    }

    if (query.location?.trim()) {
      qb.andWhere('LOWER(business.location) LIKE :location', {
        location: `%${query.location.trim().toLowerCase()}%`,
      });
    }

    const businesses = await qb.getMany();
    return businesses.map((business) => ({
      ...business,
      imageUrls: business.images?.map((image) => image.imageUrl) ?? [],
    }));
  }

  async getAdminBusinesses(currentUser: UserEntity) {
    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    const businesses = await this.businessesRepository.find({
      relations: { images: true },
      order: { createdAt: 'DESC' },
    });
    return businesses.map((business) => ({
      ...business,
      imageUrls: business.images?.map((image) => image.imageUrl) ?? [],
    }));
  }

  async createBusiness(currentUser: UserEntity, input: CreateBusinessDto) {
    this.usersService.ensureRole(currentUser, [UserRole.CLIENT]);

    const business = this.businessesRepository.create({
      ownerId: currentUser.id,
      name: input.name.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      location: input.location.trim(),
      contact: input.contact.trim(),
    });

    const saved = await this.businessesRepository.save(business);
    await this.notificationsService.createForUser(currentUser.id, `Business ${saved.name} created.`);
    return {
      ...saved,
      imageUrls: [],
    };
  }

  async getClientBusinesses(currentUser: UserEntity) {
    this.usersService.ensureRole(currentUser, [UserRole.CLIENT]);
    await this.createDefaultBusinessForClient(currentUser);
    const businesses = await this.businessesRepository.find({
      where: { ownerId: currentUser.id },
      relations: { images: true },
      order: { createdAt: 'DESC' },
    });
    return businesses.map((business) => ({
      ...business,
      imageUrls: business.images?.map((image) => image.imageUrl) ?? [],
    }));
  }

  async updateBusiness(currentUser: UserEntity, businessId: string, input: UpdateBusinessDto) {
    const business = await this.findBusinessOrFail(businessId);

    if (currentUser.role !== UserRole.ADMIN && business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own business');
    }

    Object.assign(business, {
      name: input.name?.trim() ?? business.name,
      description: input.description?.trim() ?? business.description,
      category: input.category?.trim() ?? business.category,
      location: input.location?.trim() ?? business.location,
      contact: input.contact?.trim() ?? business.contact,
    });

    const updated = await this.businessesRepository.save(business);
    await this.notificationsService.createForUser(updated.ownerId, `Business ${updated.name} was updated.`);
    return {
      ...updated,
      imageUrls: business.images?.map((image) => image.imageUrl) ?? [],
    };
  }

  async deleteBusiness(currentUser: UserEntity, businessId: string) {
    const business = await this.findBusinessOrFail(businessId);

    if (currentUser.role !== UserRole.ADMIN && business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own business');
    }

    await this.businessesRepository.delete({ id: business.id });
    await this.notificationsService.createForUser(business.ownerId, `Business ${business.name} deleted.`);

    return { message: 'Business deleted' };
  }

  async removeBusinessByAdmin(currentUser: UserEntity, businessId: string) {
    this.usersService.ensureRole(currentUser, [UserRole.ADMIN]);
    const business = await this.findBusinessOrFail(businessId);
    await this.businessesRepository.delete({ id: business.id });
    await this.notificationsService.createForUser(
      business.ownerId,
      `Your business ${business.name} was removed by admin.`,
    );
    return { message: 'Business removed' };
  }

  async addBusinessImage(currentUser: UserEntity, businessId: string, input: AddBusinessImageDto) {
    const business = await this.findBusinessOrFail(businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own business images');
    }

    const image = this.businessImagesRepository.create({
      businessId: business.id,
      imageUrl: input.imageUrl.trim(),
    });
    await this.businessImagesRepository.save(image);
    return this.findBusinessOrFail(businessId).then((updated) => ({
      ...updated,
      imageUrls: updated.images?.map((entry) => entry.imageUrl) ?? [],
    }));
  }

  async listBusinessImages(businessId: string) {
    const business = await this.findBusinessOrFail(businessId);
    return (business.images ?? []).map((image) => image.imageUrl);
  }

  async deleteImage(currentUser: UserEntity, imageUrlOrId: string) {
    this.usersService.ensureRole(currentUser, [UserRole.CLIENT]);
    const image = await this.businessImagesRepository.findOne({
      where: [{ id: imageUrlOrId }, { imageUrl: imageUrlOrId }],
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    const business = await this.findBusinessOrFail(image.businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own business images');
    }

    await this.businessImagesRepository.delete({ id: image.id });
    return { message: 'Image deleted' };
  }

  async createProduct(currentUser: UserEntity, businessId: string, input: CreateProductDto) {
    const business = await this.findBusinessOrFail(businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only manage your own business stock');
    }

    const product = this.productsRepository.create({
      businessId,
      name: input.name.trim(),
      description: input.description?.trim() ?? '',
      price: Number(input.price),
      stock: Number(input.stock),
    });

    const saved = await this.productsRepository.save(product);
    await this.notificationsService.createForUser(currentUser.id, `New stock item added: ${saved.name}.`);
    return saved;
  }

  async updateProduct(currentUser: UserEntity, productId: string, input: UpdateProductDto) {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const business = await this.findBusinessOrFail(product.businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own products');
    }

    Object.assign(product, {
      name: input.name?.trim() ?? product.name,
      description: input.description?.trim() ?? product.description,
      price: input.price !== undefined ? Number(input.price) : product.price,
      stock: input.stock !== undefined ? Number(input.stock) : product.stock,
    });

    return this.productsRepository.save(product);
  }

  async deleteProduct(currentUser: UserEntity, productId: string) {
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const business = await this.findBusinessOrFail(product.businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own products');
    }

    await this.productsRepository.delete({ id: product.id });
    return { message: 'Product deleted' };
  }

  async listProductsByBusiness(businessId: string) {
    await this.findBusinessOrFail(businessId);
    return this.productsRepository.find({
      where: { businessId },
      order: { createdAt: 'DESC' },
    });
  }

  async getOwnedBusiness(currentUser: UserEntity, businessId: string) {
    const business = await this.findBusinessOrFail(businessId);
    if (business.ownerId !== currentUser.id) {
      throw new ForbiddenException('You can only access your own business');
    }
    return business;
  }

  async getOwnedBusinessOrPublic(businessId: string) {
    return this.findBusinessOrFail(businessId);
  }

  async getProductForBusiness(productId: string, businessId: string) {
    const product = await this.productsRepository.findOne({ where: { id: productId, businessId } });
    if (!product) {
      throw new NotFoundException(`Product ${productId} not found`);
    }
    return product;
  }

  async saveProduct(product: ProductEntity) {
    return this.productsRepository.save(product);
  }

  async createSeedBusiness(ownerId: string, data: CreateBusinessDto) {
    const existing = await this.businessesRepository.findOne({ where: { ownerId, name: data.name } });
    if (existing) {
      return existing;
    }
    return this.businessesRepository.save(
      this.businessesRepository.create({
        ownerId,
        name: data.name,
        description: data.description,
        category: data.category,
        location: data.location,
        contact: data.contact,
      }),
    );
  }

  async createSeedProduct(businessId: string, data: CreateProductDto) {
    const existing = await this.productsRepository.findOne({ where: { businessId, name: data.name } });
    if (existing) {
      return existing;
    }

    return this.productsRepository.save(
      this.productsRepository.create({
        businessId,
        name: data.name,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
      }),
    );
  }

  async createDefaultBusinessForClient(currentUser: UserEntity) {
    if (!currentUser.businessName?.trim()) {
      return null;
    }

    const existing = await this.businessesRepository.findOne({
      where: { ownerId: currentUser.id, name: currentUser.businessName.trim() },
    });
    if (existing) {
      return existing;
    }

    return this.businessesRepository.save(
      this.businessesRepository.create({
        ownerId: currentUser.id,
        name: currentUser.businessName.trim(),
        description: `${currentUser.businessName.trim()} profile created.`,
        category: 'General',
        location: currentUser.location?.trim() || 'Unknown',
        contact: currentUser.email,
      }),
    );
  }
}