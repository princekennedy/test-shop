import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { NotificationsService } from '../notifications/notifications.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionEntity } from './entities/session.entity';
import { UserEntity, UserRole } from './entities/user.entity';

type CurrentUser = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  location?: string | null;
  businessName?: string | null;
};

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
  ) {}

  private toCurrentUser(user: UserEntity): CurrentUser {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      location: user.location,
      businessName: user.businessName,
    };
  }

  async requireUser(token?: string): Promise<UserEntity> {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    const session = await this.sessionsRepository.findOne({ where: { token } });
    if (!session) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersRepository.findOne({ where: { id: session.userId } });
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    return user;
  }

  ensureRole(user: UserEntity, roles: UserRole[]): void {
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('You do not have access to this resource');
    }
  }

  async createUser(input: {
    username: string;
    email: string;
    password: string;
    role: UserRole;
    location?: string;
    businessName?: string;
  }): Promise<UserEntity> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.usersRepository.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email already exists');
    }

    const user = this.usersRepository.create({
      username: input.username.trim(),
      email,
      password: input.password,
      role: input.role,
      location: input.location?.trim(),
      businessName: input.businessName?.trim(),
    });

    return this.usersRepository.save(user);
  }

  async register(input: RegisterDto) {
    if (![UserRole.CLIENT, UserRole.CUSTOMER].includes(input.role)) {
      throw new BadRequestException('Role can only be customer or client');
    }

    const user = await this.createUser(input);
    const session = await this.sessionsRepository.save(
      this.sessionsRepository.create({
        userId: user.id,
        token: randomUUID(),
      }),
    );

    await this.notificationsService.createForUser(user.id, `Welcome ${user.username}, your account is ready.`);

    return {
      token: session.token,
      user: this.toCurrentUser(user),
    };
  }

  async login(input: LoginDto) {
    const email = input.email.trim().toLowerCase();
    const user = await this.usersRepository.findOne({
      where: {
        email,
        password: input.password,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const session = await this.sessionsRepository.save(
      this.sessionsRepository.create({
        userId: user.id,
        token: randomUUID(),
      }),
    );

    await this.notificationsService.createForUser(user.id, 'Successful login.');

    return {
      token: session.token,
      user: this.toCurrentUser(user),
    };
  }

  async logout(token?: string) {
    if (!token) {
      return { message: 'Logged out successfully' };
    }

    await this.sessionsRepository.delete({ token });
    return { message: 'Logged out successfully' };
  }

  async getMe(user: UserEntity) {
    return this.toCurrentUser(user);
  }

  async getAdminUsers(currentUser: UserEntity) {
    this.ensureRole(currentUser, [UserRole.ADMIN]);
    const users = await this.usersRepository.find({ order: { createdAt: 'ASC' } });
    return users.map((user) => this.toCurrentUser(user));
  }

  async findUserById(userId: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}