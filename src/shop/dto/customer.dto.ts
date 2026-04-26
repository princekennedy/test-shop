export class CreateCustomerDto {
  username: string;
  email: string;
  password: string;
  location?: string;
}

export class UpdateCustomerDto {
  username?: string;
  email?: string;
  location?: string;
  password?: string;
}