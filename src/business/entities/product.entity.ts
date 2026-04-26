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
import { BusinessEntity } from './business.entity';
import { OrderItemEntity } from '../../orders/entities/order-item.entity';

@Entity({ name: 'products' })
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BusinessEntity, (business) => business.products, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: BusinessEntity;

  @Column()
  businessId: string;

  @Column()
  name: string;

  @Column('text', { default: '' })
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => OrderItemEntity, (orderItem) => orderItem.product)
  orderItems: OrderItemEntity[];
}