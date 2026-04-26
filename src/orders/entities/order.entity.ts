import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity({ name: 'orders' })
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerId' })
  customer: UserEntity;

  @Column()
  customerId: string;

  @ManyToOne(() => BusinessEntity, (business) => business.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: BusinessEntity;

  @Column()
  businessId: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items: OrderItemEntity[];
}