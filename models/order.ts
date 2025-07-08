export interface Order {
  id?: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  orderDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateOrderInput {
  id: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount?: number;
} 