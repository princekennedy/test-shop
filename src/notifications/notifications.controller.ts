import { Body, Controller, Get, Headers, Param, Put } from '@nestjs/common';
import { UserRole } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { UpdateNotificationStateDto } from './dto/update-notification-state.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Get('notifications')
  async notifications(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.listForUser(user);
  }

  @Put('notifications/:id')
  async updateNotificationState(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateNotificationStateDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.updateReadState(user, id, body.read ?? true);
  }

  @Get('admin/notification')
  async adminNotifications(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.listForUser(user, UserRole.ADMIN);
  }

  @Put('admin/notification/:id')
  async markAdminNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateNotificationStateDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.updateReadState(user, id, body.read ?? true, UserRole.ADMIN);
  }

  @Get('client/notification')
  async clientNotifications(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.listForUser(user, UserRole.CLIENT);
  }

  @Put('client/notification/:id')
  async markClientNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateNotificationStateDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.updateReadState(user, id, body.read ?? true, UserRole.CLIENT);
  }

  @Get('customer/notification')
  async customerNotifications(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.listForUser(user, UserRole.CUSTOMER);
  }

  @Put('customer/notification/:id')
  async markCustomerNotification(
    @Headers('authorization') authorization: string,
    @Param('id') id: string,
    @Body() body: UpdateNotificationStateDto,
  ) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.notificationsService.updateReadState(user, id, body.read ?? true, UserRole.CUSTOMER);
  }
}