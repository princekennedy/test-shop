import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  location?: string;
}