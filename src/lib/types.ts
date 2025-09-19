

export type CashierRole = 'Bar' | 'Entrance' | 'Other';

export interface Event {
  id: number;
  created_at: string;
  name: string;
  start_date: string;
  end_date: string;
  venue?: string;
  event_manager?: string;
  is_active: boolean;
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
  revenue_share_percentage: number;
}

export interface Cashier {
    id: string;
    created_at: string;
    name: string;
    pin?: string;
    role: CashierRole;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  tenant_id: number;
}

// Represents a single, tenant-specific order record for reporting.
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
  transactionId: string; // Links multiple Orders to a single customer transaction
}

// Represents the entire customer transaction for receipt generation.
export interface MultiTenantOrder {
  id: string; // This is the transactionId
  createdAt: number;
  cashierId: string;
  stationId: string;
  items: OrderItem[]; // All items from all tenants
  subtotal: number;
  vat: number;
  total: number;
  constituentOrders: Order[]; // The individual tenant orders it was split into
}


export interface ActiveShift {
    stationId: string;
    cashierId: string;
    cashierName: string;
    floatAmount: number;
    startTime: string;
    eventId: number;
    role: CashierRole;
}

export interface ActiveAdmin {
    id: string;
    email: string;
}
