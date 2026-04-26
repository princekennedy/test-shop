import { Type } from 'class-transformer';
import { IsArray, IsString, Min, ValidateNested } from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId: string;

  @Type(() => Number)
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsString()
  businessId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];
}