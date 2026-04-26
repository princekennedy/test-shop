export class CreateBusinessDto {
  name: string;
  description: string;
  category: string;
  location: string;
  contact: string;
}

export class UpdateBusinessDto {
  name?: string;
  description?: string;
  category?: string;
  location?: string;
  contact?: string;
}

export class AddBusinessImageDto {
  imageUrl: string;
}

export class CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export class UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}