import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: 'notifications' })
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column()
  userId: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}