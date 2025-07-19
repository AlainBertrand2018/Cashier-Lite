export interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  createdAt: number;
  synced: boolean;
  cashierId?: string;
}
