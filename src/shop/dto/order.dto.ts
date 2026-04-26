export class CreateOrderItemDto {
  productId: string;
  quantity: number;
}

export class CreateOrderDto {
  businessId: string;
  items: CreateOrderItemDto[];
}