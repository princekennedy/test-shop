import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class RegisterDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  businessName?: string;
}