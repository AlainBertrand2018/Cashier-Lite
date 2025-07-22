
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
  completeOrder: () => Promise<void>;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: number | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (tenantData: Omit<Tenant, 'tenant_id' | 'created_at'>) => Promise<number | null>;
  addProduct: (name: string, price: number, tenant_id: number) => Promise<Product | null>;
  editProduct: (productId: string, data: { name: string; price: number }) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getTenantById: (tenantId: number | null) => Tenant | undefined;
  syncOrders: () => Promise<{ success: boolean; syncedCount: number; error?: any }>;
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
      
      completeOrder: async () => {
        const { currentOrder, selectedTenantId } = get();
        if (currentOrder.length === 0 || !selectedTenantId) return;

        const subtotal = currentOrder.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const vat = subtotal * 0.15;
        const total = subtotal + vat;

        const newOrder: Omit<Order, 'synced'> = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: selectedTenantId,
          items: currentOrder,
          subtotal,
          vat,
          total,
          createdAt: Date.now(),
        };

        let isSynced = false;
        if (supabase) {
            const orderToInsert = {
                id: newOrder.id,
                tenant_id: newOrder.tenantId,
                subtotal: newOrder.subtotal,
                vat: newOrder.vat,
                total: newOrder.total,
                created_at: new Date(newOrder.createdAt).toISOString(),
                cashier_id: null, // You can set this if you have cashier logic
            };
            const { error: orderError } = await supabase.from('orders').insert(orderToInsert);

            if (!orderError) {
                const orderItemsToInsert = newOrder.items.map(item => ({
                    order_id: newOrder.id,
                    product_id: item.id,
                    quantity: item.quantity,
                    price: item.price,
                }));
                const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);
                if (!itemsError) {
                    isSynced = true;
                } else {
                    console.error("Error saving order items, will sync later:", itemsError);
                    // In a real app, you might want to delete the order record if items fail
                }
            } else {
                 console.error("Error saving order, will sync later:", orderError);
            }
        }
        
        const finalOrder: Order = {
            ...newOrder,
            synced: isSynced,
        };
        
        set((state) => ({
          completedOrders: [...state.completedOrders, finalOrder],
          lastCompletedOrder: finalOrder,
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
      
      addProduct: async (name, price, tenant_id) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot add product.');
          return null;
        }

        const productToInsert = {
            name,
            price: Number(price),
            tenant_id,
        };

        const { data, error, statusText } = await supabase
          .from('products')
          .insert(productToInsert)
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', {
            message: error.message,
            details: error.details,
            code: error.code,
            statusText,
          }, 'Object sent:', productToInsert);
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

        const productToUpdate = {
            name: productData.name,
            price: Number(productData.price),
        };

        const { data, error, statusText } = await supabase
          .from('products')
          .update(productToUpdate)
          .eq('id', productId)
          .select()
          .single();
        
        if(error) {
            console.error('Error editing product:', {
                message: error.message,
                details: error.details,
                code: error.code,
                statusText,
            });
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
      },
      
      syncOrders: async () => {
        if (!supabase) {
          return { success: false, syncedCount: 0, error: new Error('Supabase not configured.') };
        }

        const { completedOrders } = get();
        const unsyncedOrders = completedOrders.filter(o => !o.synced);

        if (unsyncedOrders.length === 0) {
          return { success: true, syncedCount: 0 };
        }

        const ordersToInsert = unsyncedOrders.map(o => ({
          id: o.id,
          tenant_id: o.tenantId,
          subtotal: o.subtotal,
          vat: o.vat,
          total: o.total,
          created_at: new Date(o.createdAt).toISOString(),
          cashier_id: o.cashierId,
        }));

        const { error: ordersError } = await supabase.from('orders').insert(ordersToInsert);

        if (ordersError) {
          console.error('Error syncing orders:', ordersError);
          return { success: false, syncedCount: 0, error: ordersError };
        }

        const orderItemsToInsert = unsyncedOrders.flatMap(o => 
          o.items.map(item => ({
            order_id: o.id,
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
          }))
        );
        
        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

        if (itemsError) {
           console.error('Error syncing order items:', itemsError);
          // Note: In a real app, you might want to handle this more gracefully,
          // maybe by rolling back the orders insert.
          return { success: false, syncedCount: 0, error: itemsError };
        }
        
        const syncedOrderIds = unsyncedOrders.map(o => o.id);
        get().markOrdersAsSynced(syncedOrderIds);

        return { success: true, syncedCount: unsyncedOrders.length };
      }

    }),
    {
      name: 'fids-cashier-lite-storage',
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({ 
        completedOrders: state.completedOrders,
      }),
    }
  )
);

    