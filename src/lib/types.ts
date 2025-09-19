

export interface Event {
  id: number;
  created_at: string;
  name: string;
  start_date: string;
  end_date: string;
  venue?: string;
  event_manager?: string;
}

export interface ProductType {
  id: number;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  selling_price: number;
  buying_price: number;
  stock: number;
  initial_stock: number;
  product_type_id: number | null;
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

export interface OrderItem {
  id: string;
  name: string;
  price: number; // This remains 'price' for the context of an order line item
  quantity: number;
  tenant_id: number;
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
  cashierId: string;
  stationId: string;
}

export interface ActiveShift {
    stationId: string;
    cashierId: string;
    cashierName: string;
    floatAmount: number;
    startTime: string;
    eventId: number;
}

export interface ActiveAdmin {
    id: string;
    email: string;
}
