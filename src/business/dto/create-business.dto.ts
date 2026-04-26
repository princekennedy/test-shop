import { IsString } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  location: string;

  @IsString()
  contact: string;
}