export interface Product {
  id: number;
  name: string;
  price: number;
  tenant_id: number;
}

export interface Tenant {
  tenant_id: number;
  created_at: string;
  name: string;
  responsibleParty: string;
  brn?: string;
  vat?: string;
  mobile: string;
  address?: string;
}

export interface OrderItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  tenantId: number;
  items: OrderItem[];
  subtotal: number;
  vat: number;
  total: number;
  createdAt: number;
  synced: boolean;
  cashierId?: string;
}
