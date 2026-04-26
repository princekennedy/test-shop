import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}