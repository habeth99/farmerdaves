export interface Item {
  id?: string;
  name: string;
  price: number;
  size: number; // Changed from string to number to match your database
  image?: string; // Adding image field for inventory display
  createdAt?: Date;
  updatedAt?: Date;
}

export type CreateItemInput = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateItemInput = Partial<CreateItemInput> & {
  id: string;
};
