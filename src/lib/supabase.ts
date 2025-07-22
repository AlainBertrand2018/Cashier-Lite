
import { createClient } from '@supabase/supabase-js'
import type { Tenant, Product, Order } from './types';

export type Database = {
  public: {
    Tables: {
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
      products: {
        Row: {
            id: string; // uuid
            name: string;
            price: number;
            tenant_id: number;
            created_at: string;
        };
        Insert: {
            name: string;
            price: number;
            tenant_id: number;
        };
        Update: Partial<{
            name: string;
            price: number;
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
          cashier_id: string | null; // uuid
        };
        Insert: {
          id: string;
          created_at: string;
          tenant_id: number;
          total: number;
          vat: number;
          subtotal: number;
          cashier_id?: string | null;
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
      }
    }
    Functions: {}
    Enums: {}
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL and/or Anon Key are not defined in .env. The app will run in offline-only mode.')
}

export const supabase = supabaseUrl && supabaseAnonKey ? createClient<Database>(supabaseUrl, supabaseAnonKey) : null;
