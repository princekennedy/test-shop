import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BusinessImageEntity } from './business-image.entity';
import { ProductEntity } from './product.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

@Entity({ name: 'businesses' })
export class BusinessEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.businesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  owner: UserEntity;

  @Column()
  ownerId: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column()
  category: string;

  @Column()
  location: string;

  @Column()
  contact: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => BusinessImageEntity, (image) => image.business)
  images: BusinessImageEntity[];

  @OneToMany(() => ProductEntity, (product) => product.business)
  products: ProductEntity[];

  @OneToMany(() => OrderEntity, (order) => order.business)
  orders: OrderEntity[];
}