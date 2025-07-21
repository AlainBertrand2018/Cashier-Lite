export interface Product {
  id: string;
  name: string;
  price: number;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  responsibleParty: string;
  brn?: string;
  vat?: string;
  mobile?: string;
  address?: string;
  createdAt: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  tenantId: string;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  createdAt: number;
  synced: boolean;
  cashierId?: string;
}
