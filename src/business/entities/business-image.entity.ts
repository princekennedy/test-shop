import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BusinessEntity } from './business.entity';

@Entity({ name: 'business_images' })
export class BusinessImageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BusinessEntity, (business) => business.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: BusinessEntity;

  @Column()
  businessId: string;

  @Column('text')
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}