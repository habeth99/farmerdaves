export interface Item {
  id?: string;
  name: string;
  price: number;
  size: number; // Changed from string to number to match your database
  quantity: number; // Added quantity field
  description?: string; // Added optional description field
  image?: string; // Adding image field for inventory display
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

// More precise update type - only allow fields that can actually be updated
export interface UpdateItemInput {
  id: string;
  name?: string;
  price?: number;
  size?: number;
  quantity?: number;
  description?: string;
  image?: string;
}

// Helper type for creating clean update objects without undefined values
export type CleanUpdateItemInput = UpdateItemInput & Record<string, any>;
