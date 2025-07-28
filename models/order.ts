export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
  description?: string;
  orderDate: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  size: number;
  subtotal: number;
}

export type CreateOrderInput = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

export interface UpdateOrderInput {
  id: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount?: number;
} 