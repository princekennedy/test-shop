import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity, UserRole } from '../users/entities/user.entity';
import { NotificationEntity } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationsRepository: Repository<NotificationEntity>,
  ) {}

  private ensureRole(currentUser: UserEntity, expectedRole?: UserRole) {
    if (expectedRole && currentUser.role !== expectedRole) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  async createForUser(userId: string, message: string): Promise<NotificationEntity> {
    const notification = this.notificationsRepository.create({
      userId,
      message,
      read: false,
    });
    return this.notificationsRepository.save(notification);
  }

  async createForUsers(userIds: string[], message: string) {
    if (!userIds.length) {
      return [];
    }

    const notifications = userIds.map((userId) =>
      this.notificationsRepository.create({
        userId,
        message,
        read: false,
      }),
    );

    return this.notificationsRepository.save(notifications);
  }

  async listForUser(currentUser: UserEntity, expectedRole?: UserRole) {
    this.ensureRole(currentUser, expectedRole);
    return this.notificationsRepository.find({
      where: { userId: currentUser.id },
      order: { createdAt: 'DESC' },
    });
  }

  async updateReadState(currentUser: UserEntity, notificationId: string, read: boolean, expectedRole?: UserRole) {
    this.ensureRole(currentUser, expectedRole);

    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own notifications');
    }

    notification.read = read;
    return this.notificationsRepository.save(notification);
  }
}