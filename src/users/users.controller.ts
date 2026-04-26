import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getToken(authHeader?: string): string {
    if (!authHeader) {
      return '';
    }
    return authHeader.replace(/^Bearer\s+/i, '').trim();
  }

  @Post('auth/register')
  register(@Body() body: RegisterDto) {
    return this.usersService.register(body);
  }

  @Post('auth/login')
  login(@Body() body: LoginDto) {
    return this.usersService.login(body);
  }

  @Post('auth/logout')
  logout(@Headers('authorization') authorization?: string) {
    return this.usersService.logout(this.getToken(authorization));
  }

  @Get('auth/me')
  async me(@Headers('authorization') authorization?: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.usersService.getMe(user);
  }

  @Get('admin/users')
  async adminUsers(@Headers('authorization') authorization: string) {
    const user = await this.usersService.requireUser(this.getToken(authorization));
    return this.usersService.getAdminUsers(user);
  }
}