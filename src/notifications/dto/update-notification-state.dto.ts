import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationStateDto {
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  read?: boolean;
}