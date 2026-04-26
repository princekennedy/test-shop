import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../../business/entities/product.entity';

@Entity({ name: 'order_items' })
export class OrderItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: OrderEntity;

  @Column()
  orderId: string;

  @ManyToOne(() => ProductEntity, (product) => product.orderItems, { eager: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'productId' })
  product: ProductEntity;

  @Column()
  productId: string;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;
}