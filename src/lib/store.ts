
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
  fetchTenants: (force?: boolean) => Promise<void>;
  fetchProducts: (tenantId: number) => Promise<void>;
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
  addProduct: (productData: { name: string; price: number; tenant_id: number; }) => Promise<Product | null>;
  editProduct: (productId: string, data: { name: string; price: number }) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getTenantById: (tenantId: number | null) => Tenant | undefined;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenants: [],
      products: [],
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,
      selectedTenantId: null,

      fetchTenants: async (force = false) => {
        if (!force && get().tenants.length > 0) {
            return;
        }

        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchTenants.");
          return;
        }
        const { data, error } = await supabase.from('tenants').select();
        if (error) {
          console.error('Error fetching tenants:', error);
          return;
        }
        
        const fetchedTenants = data.map(item => ({
          tenant_id: item.tenant_id,
          created_at: item.created_at,
          name: item.name,
          responsibleParty: item.responsibleParty,
          brn: item.brn || undefined,
          vat: item.vat || undefined,
          mobile: item.mobile,
          address: item.address || undefined,
        }));
        set({ tenants: fetchedTenants });
      },

      fetchProducts: async (tenantId: number) => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchProducts.");
          set({ products: [] });
          return;
        }
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('tenant_id', tenantId);

        if (error) {
          console.error(`Error fetching products for tenant ${tenantId}:`, error);
          set({ products: [] });
          return;
        }
        set({ products: data || [] });
      },

      getTenantById: (tenantId: number | null) => {
        if (!tenantId) return undefined;
        return get().tenants.find(t => t.tenant_id === tenantId);
      },

      setSelectedTenantId: (tenantId: number | null) => {
        if (get().selectedTenantId !== tenantId) {
          set({ currentOrder: [], products: [] }); // Clear products when tenant changes
        }
        set({ selectedTenantId: tenantId });
        if (tenantId) {
            get().fetchProducts(tenantId);
        }
      },
      
      resetToTenantSelection: () => {
        set({
          currentOrder: [],
          selectedTenantId: null,
          lastCompletedOrder: null,
          products: [],
        });
      },

      addProductToOrder: (product) => {
        const { currentOrder, selectedTenantId } = get();
        
        if (currentOrder.length > 0 && currentOrder[0].tenant_id !== product.tenant_id) {
          console.error("Cannot add products from different tenants to the same order.");
          return;
        }
         if (selectedTenantId !== product.tenant_id) {
            console.error("Product does not belong to the selected tenant.");
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
        
        await get().fetchTenants(true);

        return data?.tenant_id || null;
      },
      
      addProduct: async (productData: { name: string; price: number; tenant_id: number; }) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot add product.');
          return null;
        }

        const { data, error } = await supabase
          .from('products')
          .insert({
            name: productData.name,
            price: productData.price,
            tenant_id: productData.tenant_id,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', error);
          return null;
        }
        
        if(data) {
           await get().fetchProducts(data.tenant_id);
        }

        return data;
      },

      editProduct: async (productId, productData) => {
         if (!supabase) {
          console.error('Supabase not configured. Cannot edit product.');
          return;
        }
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();
        
        if(error) {
            console.error('Error editing product:', error);
            return;
        }
        
        if (data) {
           await get().fetchProducts(data.tenant_id);
        }
      },

      deleteProduct: async (productId: string) => {
        const { products } = get();
        const productToDelete = products.find(p => p.id === productId);

        if (!productToDelete || !supabase) {
            console.error('Product not found or Supabase not configured.');
            return;
        }

        const { error } = await supabase.from('products').delete().eq('id', productId);

        if (error) {
            console.error('Error deleting product:', error);
            return;
        }
        await get().fetchProducts(productToDelete.tenant_id);
      }

    }),
    {
      name: 'fids-cashier-lite-storage',
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({ 
        completedOrders: state.completedOrders,
        products: state.products,
      }),
    }
  )
);
