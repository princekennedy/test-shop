import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SessionEntity } from './session.entity';
import { NotificationEntity } from '../../notifications/entities/notification.entity';
import { BusinessEntity } from '../../business/entities/business.entity';
import { OrderEntity } from '../../orders/entities/order.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
  CUSTOMER = 'customer',
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'varchar' })
  role: UserRole;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  businessName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SessionEntity, (session) => session.user)
  sessions: SessionEntity[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  notifications: NotificationEntity[];

  @OneToMany(() => BusinessEntity, (business) => business.owner)
  businesses: BusinessEntity[];

  @OneToMany(() => OrderEntity, (order) => order.customer)
  orders: OrderEntity[];

  @BeforeInsert()
  normalizeEmail(): void {
    this.email = this.email.trim().toLowerCase();
  }
}