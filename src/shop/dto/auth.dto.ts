import { UserRole } from '../entities/shop.entity';

export class RegisterDto {
  username: string;
  email: string;
  password: string;
  role: Extract<UserRole, 'customer' | 'client'>;
  location?: string;
  businessName?: string;
}

export class LoginDto {
  email: string;
  password: string;
}