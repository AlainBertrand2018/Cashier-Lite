

'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, OrderItem, Order, Tenant, Cashier, ActiveShift, ActiveAdmin, ProductType } from './types';
import { supabase } from './supabase';

interface AppState {
  tenants: Tenant[];
  products: Product[];
  productTypes: ProductType[];
  cashiers: Cashier[];
  currentOrder: OrderItem[];
  completedOrders: Order[];
  lastCompletedOrder: Order | null;
  selectedTenantId: number | null;
  isReportingDone: boolean;
  activeShift: ActiveShift | null;
  activeAdmin: ActiveAdmin | null;

  fetchTenants: (force?: boolean) => Promise<void>;
  fetchProducts: (tenantId: number) => Promise<void>;
  fetchProductTypes: () => Promise<void>;
  fetchCashiers: (force?: boolean) => Promise<void>;

  startShift: (cashierId: string, pin: string, floatAmount: number) => Promise<boolean>;
  logoutShift: () => void;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;


  addProductToOrder: (product: Product) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  clearCompletedOrders: () => void;
  completeOrder: () => Promise<void>;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: number | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (tenantData: Omit<Tenant, 'tenant_id' | 'created_at'>) => Promise<number | null>;
  deleteTenant: (tenantId: number) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => Promise<Product | null>;
  editProduct: (productId: string, data: Partial<Omit<Product, 'id' | 'created_at' | 'tenant_id'>>) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getTenantById: (tenantId: number | null) => Tenant | undefined;
  syncOrders: () => Promise<{ success: boolean; syncedCount: number; error?: any }>;
  setReportingDone: (isDone: boolean) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenants: [],
      products: [],
      productTypes: [],
      cashiers: [],
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,
      selectedTenantId: null,
      isReportingDone: false,
      activeShift: null,
      activeAdmin: null,

      fetchTenants: async (force = false) => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchTenants.");
          return;
        }
        if (!force && get().tenants.length > 0) {
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

      fetchProductTypes: async () => {
         if (!supabase) {
          console.log("Supabase not configured. Skipping fetchProductTypes.");
          return;
        }
        if (get().productTypes.length > 0) return;

        const { data, error } = await supabase.from('product_types').select('*');
        if (error) {
          console.error('Error fetching product types:', error);
          return;
        }
        set({ productTypes: data || [] });
      },

       fetchCashiers: async (force = false) => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchCashiers.");
          return;
        }
        if (!force && get().cashiers.length > 0) {
          return;
        }
        const { data, error } = await supabase.from('cashiers').select();
        if (error) {
          console.error('Error fetching cashiers:', error);
          return;
        }
        set({ cashiers: data || [] });
      },
      
      startShift: async (cashierId: string, pin: string, floatAmount: number) => {
        if (!supabase) {
          console.error('Supabase not configured, cannot start shift.');
          return false;
        }
        const { data: cashier, error } = await supabase
          .from('cashiers')
          .select('id, name, pin')
          .eq('id', cashierId)
          .single();

        if (error || !cashier) {
          console.error('Cashier not found', error);
          return false;
        }

        if (cashier.pin !== pin) {
          console.error('Invalid PIN');
          return false;
        }
        
        const { data: station, error: stationError } = await supabase
          .from('cashing_stations')
          .insert({
            current_cashier_id: cashier.id,
            last_login_at: new Date().toISOString(),
            starting_float: floatAmount,
          })
          .select()
          .single();

        if (stationError || !station) {
            console.error('Could not create cashing station session', stationError);
            return false;
        }
        
        set({ 
            activeShift: {
                stationId: station.id,
                cashierId: cashier.id,
                cashierName: cashier.name,
                floatAmount: floatAmount,
                startTime: new Date().toISOString(),
            },
            activeAdmin: null,
            selectedTenantId: null,
            currentOrder: [],
         });
        return true;
      },
      
      logoutShift: () => {
          set({ activeShift: null });
      },

      adminLogin: async (email, password) => {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured.' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }

        if (data.user) {
            set({
                activeAdmin: { id: data.user.id, email: data.user.email || '' },
                activeShift: null,
                selectedTenantId: null,
                currentOrder: [],
            });
            return { success: true };
        }

        return { success: false, error: 'An unknown error occurred.' };
      },
      
      adminSignUp: async (email, password) => {
        if (!supabase) {
            return { success: false, error: 'Supabase not configured.' };
        }
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
        });

        if (error) {
            return { success: false, error: error.message };
        }
        
        return { success: true };
      },


      adminLogout: async () => {
        if (supabase) {
            await supabase.auth.signOut();
        }
        set({ activeAdmin: null });
      },

      getTenantById: (tenantId: number | null) => {
        if (!tenantId) return undefined;
        return get().tenants.find(t => t.tenant_id === tenantId);
      },

      setSelectedTenantId: (tenantId: number | null) => {
        if (get().selectedTenantId !== tenantId) {
          set({ currentOrder: [], products: [] }); 
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
        const { currentOrder, selectedTenantId, activeAdmin } = get();
        
        if (activeAdmin) {
            console.log("Admin cannot add products to order.");
            return;
        }

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
          set({ currentOrder: [...currentOrder, { 
            id: product.id, 
            name: product.name, 
            price: product.selling_price, 
            quantity: 1,
            tenant_id: product.tenant_id
          }] });
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

      clearCompletedOrders: () => {
        // This is now for clearing the *previous* shift's data.
        set({ completedOrders: [], isReportingDone: false, activeShift: null, activeAdmin: null });
      },
      
      setLastCompletedOrder: (order: Order | null) => {
        set({ lastCompletedOrder: order });
      },
      
      completeOrder: async () => {
        const { currentOrder, selectedTenantId, activeShift } = get();
        if (currentOrder.length === 0 || !selectedTenantId || !activeShift) return;

        const subtotal = currentOrder.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const vat = subtotal * 0.15;
        const total = subtotal + vat;

        const newOrder: Omit<Order, 'synced'> = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: selectedTenantId,
          cashierId: activeShift.cashierId,
          stationId: activeShift.stationId,
          items: currentOrder,
          subtotal,
          vat,
          total,
          createdAt: Date.now(),
        };

        let isSynced = false;
        if (supabase) {
            let orderToInsert: any = {
                id: newOrder.id,
                tenant_id: newOrder.tenantId,
                subtotal: newOrder.subtotal,
                vat: newOrder.vat,
                total: newOrder.total,
                created_at: new Date(newOrder.createdAt).toISOString(),
                cashier_id: newOrder.cashierId,
                station_id: newOrder.stationId,
            };
            
            let { error: orderError } = await supabase.from('orders').insert(orderToInsert);

            // This is a resilience check. If the schema cache is stale and doesn't know about
            // the new cashier_id or station_id columns, it will fail. We can retry without them.
            if (orderError) {
                const isSchemaCacheError = orderError.message.includes("does not exist") || orderError.message.includes("Could not find the");
                
                if (isSchemaCacheError) {
                    console.warn("Schema cache might be stale. Retrying insert without station/cashier ID.", orderError.message);
                    delete orderToInsert.cashier_id;
                    delete orderToInsert.station_id;
                    const retryResult = await supabase.from('orders').insert(orderToInsert);
                    orderError = retryResult.error;
                }
            }
            

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
                    console.error("Error saving order items, will sync later:", JSON.stringify(itemsError, null, 2));
                }
            } else {
                 console.error("Error saving order, will sync later:", JSON.stringify(orderError, null, 2));
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

      deleteTenant: async (tenantId: number) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot delete tenant.');
          return;
        }

        // First, delete all products associated with the tenant
        const { error: productError } = await supabase
          .from('products')
          .delete()
          .eq('tenant_id', tenantId);

        if (productError) {
          console.error(`Error deleting products for tenant ${tenantId}:`, productError);
          return; // Stop execution if products can't be deleted
        }

        // Then, delete the tenant
        const { error: tenantError } = await supabase
          .from('tenants')
          .delete()
          .eq('tenant_id', tenantId);

        if (tenantError) {
          console.error(`Error deleting tenant ${tenantId}:`, tenantError);
          return;
        }

        // Refresh the tenants list in the store
        await get().fetchTenants(true);
      },
      
      addProduct: async (productData) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot add product.');
          return null;
        }

        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', error, 'Object sent:', productData);
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
      },
      
      syncOrders: async () => {
        if (!supabase) {
          return { success: false, syncedCount: 0, error: new Error('Supabase not configured.') };
        }

        const { completedOrders, activeShift } = get();
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
          cashier_id: o.cashierId || activeShift?.cashierId || null,
          station_id: o.stationId || activeShift?.stationId || null,
        }));

        const { error: ordersError } = await supabase.from('orders').insert(ordersToInsert, { onConflict: 'id' });

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
          // Don't mark as synced if items fail
          return { success: false, syncedCount: 0, error: itemsError };
        }
        
        const syncedOrderIds = unsyncedOrders.map(o => o.id);
        get().markOrdersAsSynced(syncedOrderIds);

        return { success: true, syncedCount: unsyncedOrders.length };
      },

      setReportingDone: (isDone: boolean) => {
        set({ isReportingDone: isDone });
      },

    }),
    {
      name: 'fids-cashier-lite-storage',
      storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({ 
        completedOrders: state.completedOrders,
        cashiers: state.cashiers,
        activeShift: state.activeShift,
        activeAdmin: state.activeAdmin,
        isReportingDone: state.isReportingDone,
      }),
    }
  )
);
