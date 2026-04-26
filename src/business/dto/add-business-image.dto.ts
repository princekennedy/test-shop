import { IsString } from 'class-validator';

export class AddBusinessImageDto {
  @IsString()
  imageUrl: string;
}