
import { createClient, User } from '@supabase/supabase-js'
import type { Tenant, Product, Order } from './types';

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          start_date: string;
          end_date: string;
          venue: string | null;
          event_manager: string | null;
          is_active: boolean;
        };
        Insert: {
          name: string;
          start_date: string;
          end_date: string;
          venue?: string | null;
          event_manager?: string | null;
          is_active?: boolean;
        };
      };
      tenants: {
        Row: {
          tenant_id: number;
          created_at: string;
          name: string;
          responsibleParty: string;
          brn: string | null;
          vat: string | null;
          mobile: string;
          address: string | null;
        };
        Insert: Omit<Tenant, 'tenant_id' | 'created_at'>;
        Update: Partial<Omit<Tenant, 'tenant_id' | 'created_at'>>;
      },
      product_types: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          name: string;
        };
      },
      products: {
        Row: {
            id: string; // uuid
            name: string;
            selling_price: number;
            buying_price: number;
            stock: number;
            initial_stock: number;
            product_type_id: number | null;
            tenant_id: number;
            created_at: string;
        };
        Insert: {
            name: string;
            selling_price: number;
            buying_price: number;
            stock: number;
            initial_stock: number;
            product_type_id: number | null;
            tenant_id: number;
        };
        Update: Partial<{
            name: string;
            selling_price: number;
            buying_price: number;
            stock: number;
            initial_stock: number;
            product_type_id: number | null;
        }>;
      },
      cashiers: {
        Row: {
            id: string; // uuid
            created_at: string;
            name: string;
            pin: string | null;
        };
        Insert: {
            name: string;
            pin?: string | null;
        };
      },
      orders: {
        Row: {
          id: string; // text
          created_at: string;
          tenant_id: number;
          total: number;
          vat: number;
          subtotal: number;
          cashier_id: string | null;
          station_id: string | null;
          transaction_id: string | null;
        };
        Insert: {
          id: string;
          created_at: string;
          tenant_id: number;
          total: number;
          vat: number;
          subtotal: number;
          cashier_id?: string | null;
          station_id?: string | null;
          transaction_id?: string | null;
        };
      },
      order_items: {
         Row: {
          id: number;
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
        Insert: {
          order_id: string;
          product_id: string;
          quantity: number;
          price: number;
        };
      },
      reports: {
        Row: {
          id: string;
          created_at: string;
          report_type: string;
          generated_by_cashier_id: string | null;
          tenant_id: number | null;
          report_data_json: any;
          storage_path: string | null;
          event_id: number | null;
        };
      },
      receipts: {
        Row: {
          id: string;
          created_at: string;
          order_id: string;
          generated_by_cashier_id: string;
          receipt_data_json: any;
          storage_path: string | null;
          event_id: number | null;
        };
      },
      cashing_stations: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          is_active: boolean;
          current_cashier_id: string | null;
          last_login_at: string | null;
          starting_float: number;
          event_id: number | null;
        };
        Insert: {
            id?: string;
            name?: string;
            is_active?: boolean;
            current_cashier_id?: string | null;
            last_login_at?: string | null;
            starting_float?: number;
            event_id?: number | null;
        };
      }
    }
    Functions: {
      decrement_product_stock: {
        Args: {
          p_product_id: string;
          p_quantity_sold: number;
        };
        Returns: undefined;
      };
      increment_product_stock: {
        Args: {
          p_product_id: string;
          p_quantity_added: number;
        };
        Returns: undefined;
      };
      set_active_event: {
        Args: {
          event_id_to_set: number;
        };
        Returns: undefined;
      };
    }
    Enums: {}
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and/or Anon Key are not defined in .env. The app will run in offline-only mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null;

    