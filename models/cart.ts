export interface CartItem {
  id: string; // Cart item ID (not the product ID)
  productId: string; // Reference to the actual item
  productName: string;
  productPrice: number;
  productSize: number;
  productImage?: string;
  quantity: number;
  addedAt: Date;
  expiresAt: Date; // 24 hours from addedAt
}

export interface Cart {
  id?: string; // Cart document ID
  userId: string; // User who owns this cart
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartInput {
  productId: string;
  productName: string;
  productPrice: number;
  productSize: number;
  productImage?: string;
  quantity: number;
}

export interface UpdateCartItemInput {
  cartItemId: string;
  quantity: number;
} 