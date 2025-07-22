
export interface Product {
  id: string;
  name: string;
  price: number;
  tenant_id: number;
  created_at?: string;
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

export interface Cashier {
    id: string;
    created_at: string;
    name: string;
    pin?: string;
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
