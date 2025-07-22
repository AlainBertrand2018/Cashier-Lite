
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, OrderItem, Order, Tenant } from './types';
import { supabase } from './supabase';

interface AppState {
  tenants: Tenant[];
  products: Product[];
  currentOrder: OrderItem[];
  completedOrders: Order[];
  lastCompletedOrder: Order | null;
  selectedTenantId: number | null;
  fetchTenants: () => Promise<void>;
  addProductToOrder: (product: Product) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  completeOrder: () => void;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: number | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (tenantData: Omit<Tenant, 'tenant_id' | 'created_at'>) => Promise<number | null>;
  addProduct: (name: string, price: number, tenantId: string) => void;
  editProduct: (productId: string, data: { name: string; price: number }) => void;
  deleteProduct: (productId: string) => void;
  getTenantById: (tenantId: number | null) => Tenant | undefined;
}

const initialProducts: Product[] = [
    // Mauritius Fried Chicken
    { id: 'mfc1', name: 'Large Spicy', price: 90.00, tenantId: '101' },
    { id: 'mfc2', name: 'Wings (5)', price: 80.00, tenantId: '101' },
    { id: 'mfc3', name: 'Mixed Platter', price: 200.00, tenantId: '101' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenants: [],
      products: initialProducts,
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,
      selectedTenantId: null,

      fetchTenants: async () => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchTenants.");
          return;
        }
        const { data, error } = await supabase.from('tenants').select();
        if (error) {
          console.error('Error fetching tenants:', error);
          return;
        }
        
        // Map Supabase response to Tenant type
        const tenants = data.map(item => ({
          tenant_id: item.tenant_id,
          created_at: item.created_at,
          name: item.name,
          responsibleParty: item.responsibleParty,
          brn: item.brn || undefined,
          vat: item.vat || undefined,
          mobile: item.mobile,
          address: item.address || undefined,
        }));
        set({ tenants });
      },

      getTenantById: (tenantId: number | null) => {
        if (!tenantId) return undefined;
        return get().tenants.find(t => t.tenant_id === tenantId);
      },

      setSelectedTenantId: (tenantId: number | null) => {
        if (get().selectedTenantId !== tenantId) {
          set({ currentOrder: [] });
        }
        set({ selectedTenantId: tenantId });
      },
      
      resetToTenantSelection: () => {
        set({
          currentOrder: [],
          selectedTenantId: null,
          lastCompletedOrder: null,
        });
      },

      addProductToOrder: (product) => {
        const { currentOrder } = get();
        
        if (currentOrder.length > 0 && currentOrder[0].tenantId !== product.tenantId) {
          console.error("Cannot add products from different tenants to the same order.");
          return;
        }

        const existingItem = currentOrder.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            currentOrder: currentOrder.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ currentOrder: [...currentOrder, { ...product, quantity: 1 }] });
        }
      },

      removeProductFromOrder: (productId) => {
        set({
          currentOrder: get().currentOrder.filter(
            (item) => item.id !== productId
          ),
        });
      },

      updateProductQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeProductFromOrder(productId);
        } else {
          set({
            currentOrder: get().currentOrder.map((item) =>
              item.id === productId ? { ...item, quantity } : item
            ),
          });
        }
      },

      clearCurrentOrder: () => {
        set({ currentOrder: [] });
      },
      
      setLastCompletedOrder: (order: Order | null) => {
        set({ lastCompletedOrder: order });
      },
      
      completeOrder: () => {
        const { currentOrder, selectedTenantId } = get();
        if (currentOrder.length === 0 || !selectedTenantId) return;

        const subtotal = currentOrder.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const vat = subtotal * 0.15;
        const total = subtotal + vat;

        const newOrder: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: selectedTenantId,
          items: currentOrder,
          subtotal,
          vat,
          total,
          createdAt: Date.now(),
          synced: false,
        };
        
        set((state) => ({
          completedOrders: [...state.completedOrders, newOrder],
          lastCompletedOrder: newOrder,
          currentOrder: [],
        }));
      },

      markOrdersAsSynced: (orderIds: string[]) => {
        set((state) => ({
          completedOrders: state.completedOrders.map((order) => 
            orderIds.includes(order.id) ? { ...order, synced: true } : order
          )
        }))
      },

      addTenant: async (tenantData) => {
        if (!supabase) {
           console.error('Supabase not configured. Cannot add tenant.');
           return null;
        }
        const { data, error } = await supabase
          .from('tenants')
          .insert([tenantData])
          .select()
          .single();

        if (error) {
          console.error('Error adding tenant:', error);
          return null;
        }
        
        // Refresh local state after successful insert
        await get().fetchTenants();

        return data?.tenant_id || null;
      },

      addProduct: (name: string, price: number, tenantId: string) => {
        const { tenants } = get();
        const tenant = tenants.find(t => t.tenant_id.toString() === tenantId);

        if (!tenant) {
          console.error(`Cannot add product. Tenant with ID ${tenantId} not found.`);
          return;
        }

        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name,
          price,
          tenantId,
        }

        set(state => ({
          products: [...state.products, newProduct]
        }));
      },

      editProduct: (productId, data) => {
        set(state => ({
          products: state.products.map(p => 
            p.id === productId ? { ...p, ...data } : p
          )
        }));
      },

      deleteProduct: (productId) => {
        set(state => ({
          products: state.products.filter(p => p.id !== productId)
        }));
      }

    }),
    {
      name: 'fids-cashier-lite-storage',
      storage: createJSONStorage(() => localStorage),
      // We only persist data that should be available offline.
      // Tenants are now fetched from Supabase and should not be persisted.
      partialize: (state) => ({ 
        completedOrders: state.completedOrders,
        products: state.products,
      }),
    }
  )
);
