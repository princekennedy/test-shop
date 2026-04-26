export type UserRole = 'admin' | 'client' | 'customer';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  location?: string;
  businessName?: string;
}

export interface Session {
  token: string;
  userId: string;
}

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  location: string;
  contact: string;
  imageUrls: string[];
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  businessId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  location?: string;
  businessName?: string;
}