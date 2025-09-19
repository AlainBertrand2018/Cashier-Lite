
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, OrderItem, Order, Tenant, Cashier, ActiveShift, ActiveAdmin, ProductType, Event, MultiTenantOrder, CashierRole } from './types';
import { supabase } from './supabase';

interface AppState {
  tenants: Tenant[];
  products: Product[];
  productTypes: ProductType[];
  cashiers: Cashier[];
  events: Event[];
  activeEvent: Event | null;
  currentOrder: OrderItem[];
  completedOrders: Order[];
  lastCompletedOrder: MultiTenantOrder | null;
  selectedTenantId: number | null; // Represents the tenant of the *first* item added to an order.
  isReportingDone: boolean;
  activeShift: ActiveShift | null;
  activeAdmin: ActiveAdmin | null;
  productForTenantSwitch: Product | null;


  fetchTenants: (force?: boolean) => Promise<void>;
  fetchProducts: (tenantId: number) => Promise<void>;
  fetchAllProducts: () => Promise<void>;
  fetchProductTypes: (role?: CashierRole) => Promise<void>;
  fetchCashiers: (force?: boolean) => Promise<void>;
  fetchEvents: (force?: boolean) => Promise<void>;

  startShift: (eventId: number, cashierId: string, pin: string, floatAmount: number) => Promise<boolean>;
  logoutShift: () => void;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminSignUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;


  addProductToOrder: (product: Product) => void;
  startNewOrderWithProduct: (product: Product) => void; // This might be deprecated now
  setProductForTenantSwitch: (product: Product | null) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  clearCompletedOrders: () => void;
  completeOrder: () => Promise<void>;
  setLastCompletedOrder: (order: MultiTenantOrder | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: number | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (tenantData: Omit<Tenant, 'tenant_id' | 'created_at'>) => Promise<number | null>;
  editTenant: (tenantId: number, tenantData: Partial<Omit<Tenant, 'tenant_id' | 'created_at'>>) => Promise<void>;
  deleteTenant: (tenantId: number) => Promise<void>;
  addProduct: (productData: Omit<Product, 'id' | 'created_at' | 'initial_stock'>) => Promise<Product | null>;
  editProduct: (productId: string, data: Partial<Omit<Product, 'id' | 'created_at' | 'tenant_id' | 'initial_stock'>>) => Promise<void>;
  addStock: (productId: string, quantity: number) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  addCashier: (name: string, pin: string, role: CashierRole) => Promise<boolean>;
  editCashier: (cashierId: string, data: Partial<Cashier>) => Promise<boolean>;
  getTenantById: (tenantId: number | null) => Tenant | undefined;
  getActiveEvent: () => Event | undefined;
  syncOrders: () => Promise<{ success: boolean; syncedCount: number; error?: any }>;
  setReportingDone: (isDone: boolean) => void;
  createEvent: (eventData: Omit<Event, 'id' | 'created_at' | 'is_active'>) => Promise<boolean>;
  setActiveEvent: (eventId: number) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      tenants: [],
      products: [],
      productTypes: [],
      cashiers: [],
      events: [],
      activeEvent: null,
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,
      selectedTenantId: null,
      isReportingDone: false,
      activeShift: null,
      activeAdmin: null,
      productForTenantSwitch: null,


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
          revenue_share_percentage: item.revenue_share_percentage,
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

      fetchAllProducts: async () => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchAllProducts.");
          set({ products: [] });
          return;
        }
         const { data, error } = await supabase
          .from('products')
          .select('*');

        if (error) {
          console.error(`Error fetching all products:`, error);
          set({ products: data || [] });
          return;
        }
        set({ products: data || [] });
      },

      fetchProductTypes: async (role) => {
         if (!supabase) {
          console.log("Supabase not configured. Skipping fetchProductTypes.");
          return;
        }

        // Admin sees all categories. Cashier sees filtered categories.
        if (role) {
            const { data: roleData, error: roleError } = await supabase
                .from('product_category_roles')
                .select('product_type_id')
                .eq('cashier_role', role);

            if (roleError) {
                console.error(`Error fetching product types for role ${role}:`, roleError);
                set({ productTypes: [] });
                return;
            }

            const typeIds = roleData.map(r => r.product_type_id);
            if (typeIds.length === 0) {
                set({ productTypes: [] });
                return;
            }

            const { data, error } = await supabase
                .from('product_types')
                .select('*')
                .in('id', typeIds);
            
            if (error) {
                console.error('Error fetching filtered product types:', error);
                set({ productTypes: [] });
            } else {
                set({ productTypes: data || [] });
            }

        } else {
            // Admin or initial load without role
            const { data, error } = await supabase.from('product_types').select('*');
            if (error) {
              console.error('Error fetching product types:', error);
              return;
            }
            set({ productTypes: data || [] });
        }
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
          console.log('Error fetching cashiers:', error);
          return;
        }
        set({ cashiers: data || [] });
      },

      fetchEvents: async (force = false) => {
        if (!supabase) {
          console.log("Supabase not configured. Skipping fetchEvents.");
          return;
        }
        if (!force && get().events.length > 0 && get().activeEvent) {
          return;
        }
        const { data, error } = await supabase.from('events').select().order('start_date', { ascending: false });
        if (error) {
          console.error('Error fetching events:', error);
          return;
        }
        const activeEvent = data?.find(e => e.is_active) || null;
        set({ events: data || [], activeEvent });
      },
      
      startShift: async (eventId: number, cashierId: string, pin: string, floatAmount: number) => {
        if (!supabase) {
          console.error('Supabase not configured, cannot start shift.');
          return false;
        }
        const { data: cashier, error } = await supabase
          .from('cashiers')
          .select('id, name, pin, role')
          .eq('id', cashierId)
          .single();

        if (error || !cashier) {
          console.error('Cashier not found', error);
          return false;
        }

        if (cashier.pin !== pin) {
          console.warn('Invalid PIN');
          return false;
        }
        
        const { data: station, error: stationError } = await supabase
          .from('cashing_stations')
          .insert({
            event_id: eventId,
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
                eventId: eventId,
                role: cashier.role,
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

      getActiveEvent: () => {
        return get().activeEvent || undefined;
      },

      setSelectedTenantId: (tenantId: number | null) => {
        const { activeAdmin } = get();
        if (activeAdmin) {
            if (get().selectedTenantId !== tenantId) {
                set({ products: [] }); 
            }
            set({ selectedTenantId: tenantId });
            if (tenantId) {
                get().fetchProducts(tenantId);
            } else {
                get().fetchAllProducts();
            }
        }
        else {
           set({ selectedTenantId: tenantId });
        }
      },

      
      resetToTenantSelection: () => {
        set({
          currentOrder: [],
          selectedTenantId: null,
          lastCompletedOrder: null,
        });
      },

      addProductToOrder: (product) => {
        const { currentOrder, activeAdmin } = get();
        
        if (activeAdmin) {
            console.log("Admin cannot add products to order.");
            return;
        }
        
        if (product.stock <= 0) {
            console.warn(`Product "${product.name}" is out of stock.`);
            return;
        }

        const existingItem = currentOrder.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            currentOrder: currentOrder.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                // Find the tenant for the existing item to preserve it
                : item
            ),
          });
        } else {
          set({ currentOrder: [...currentOrder, { 
            id: product.id, 
            name: product.name, 
            price: product.selling_price, 
            quantity: 1,
            tenant_id: product.tenant_id,
          }] });
        }
      },
      
      startNewOrderWithProduct: (product) => {
        // This is now effectively deprecated in favor of the multi-tenant cart
        get().clearCurrentOrder();
        get().addProductToOrder(product);
        get().setProductForTenantSwitch(null);
      },

      setProductForTenantSwitch: (product) => {
        set({ productForTenantSwitch: product });
      },

      removeProductFromOrder: (productId) => {
        const newOrder = get().currentOrder.filter((item) => item.id !== productId);
        set({ currentOrder: newOrder });
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
        set({ currentOrder: [], selectedTenantId: null });
      },

      clearCompletedOrders: () => {
        // This is now for clearing the *previous* shift's data.
        set({ completedOrders: [], isReportingDone: false, activeShift: null, activeAdmin: null });
      },
      
      setLastCompletedOrder: (order: MultiTenantOrder | null) => {
        set({ lastCompletedOrder: order });
      },
      
      completeOrder: async () => {
        const { currentOrder, activeShift, fetchAllProducts } = get();
        if (currentOrder.length === 0 || !activeShift) return;
        
        const transactionTimestamp = Date.now();
        const transactionId = `txn-${transactionTimestamp}-${Math.random().toString(36).substr(2, 9)}`;

        // Group items by tenant
        const itemsByTenant = currentOrder.reduce((acc, item) => {
            const tenantId = item.tenant_id;
            if (!acc[tenantId]) {
                acc[tenantId] = [];
            }
            acc[tenantId].push(item);
            return acc;
        }, {} as Record<number, OrderItem[]>);

        const newTenantOrders: Order[] = [];
        const allItemsForReceipt = [...currentOrder];
        let totalTransactionAmount = 0;

        for (const tenantIdStr in itemsByTenant) {
            const tenantId = parseInt(tenantIdStr, 10);
            const tenantItems = itemsByTenant[tenantId];
            
            const subtotal = tenantItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const vat = subtotal * 0.15;
            const total = subtotal + vat;
            totalTransactionAmount += total;

            const newOrder: Omit<Order, 'synced'> = {
                id: `order-${transactionTimestamp}-${tenantId}`,
                tenantId: tenantId,
                cashierId: activeShift.cashierId,
                stationId: activeShift.stationId,
                items: tenantItems,
                subtotal,
                vat,
                total,
                createdAt: transactionTimestamp,
                transactionId: transactionId,
            };
            
            // --- Database Operations for this tenant's order ---
            if (supabase) {
                // Decrement stock for each item
                for (const item of newOrder.items) {
                    const { error: decrementError } = await supabase.rpc('decrement_product_stock', {
                        p_product_id: item.id,
                        p_quantity_sold: item.quantity,
                    });
                    if (decrementError) {
                        console.error(`Failed to decrement stock for product ${item.id}:`, decrementError);
                    }
                }

                // Attempt to sync this tenant's order
                let isSynced = false;
                const orderToInsert = {
                    id: newOrder.id,
                    tenant_id: newOrder.tenantId,
                    subtotal: newOrder.subtotal,
                    vat: newOrder.vat,
                    total: newOrder.total,
                    created_at: new Date(newOrder.createdAt).toISOString(),
                    cashier_id: newOrder.cashierId,
                    station_id: newOrder.stationId,
                    transaction_id: newOrder.transactionId,
                };
                
                const { error: orderError } = await supabase.from('orders').insert(orderToInsert);
                
                if (orderError) {
                    console.error(`Error saving order for tenant ${tenantId}, will sync later:`, JSON.stringify(orderError, null, 2));
                } else {
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
                        console.error(`Error saving order items for tenant ${tenantId}, will sync later:`, JSON.stringify(itemsError, null, 2));
                    }
                }
                
                const finalOrder: Order = { ...newOrder, synced: isSynced };
                newTenantOrders.push(finalOrder);
            } else {
                 newTenantOrders.push({ ...newOrder, synced: false });
            }
        }
        
        await fetchAllProducts();
        
        // Create a unified object for the receipt
        const overallSubtotal = allItemsForReceipt.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const overallVat = overallSubtotal * 0.15;
        const multiTenantOrderForReceipt: MultiTenantOrder = {
            id: transactionId,
            createdAt: transactionTimestamp,
            cashierId: activeShift.cashierId,
            stationId: activeShift.stationId,
            items: allItemsForReceipt,
            subtotal: overallSubtotal,
            vat: overallVat,
            total: totalTransactionAmount,
            constituentOrders: newTenantOrders,
        };

        set((state) => ({
          completedOrders: [...state.completedOrders, ...newTenantOrders],
          lastCompletedOrder: multiTenantOrderForReceipt,
          currentOrder: [],
          selectedTenantId: null,
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
      
      editTenant: async (tenantId, tenantData) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot edit tenant.');
          return;
        }

        const { error } = await supabase
          .from('tenants')
          .update(tenantData)
          .eq('tenant_id', tenantId);

        if (error) {
          console.error('Error editing tenant:', error);
          return;
        }
        
        await get().fetchTenants(true);
      },


      deleteTenant: async (tenantId: number) => {
        if (!supabase) {
          console.log('Supabase not configured. Cannot delete tenant.');
          return;
        }

        const { error: productError } = await supabase
          .from('products')
          .delete()
          .eq('tenant_id', tenantId);

        if (productError) {
          console.error(`Error deleting products for tenant ${tenantId}:`, productError);
          return;
        }

        const { error: tenantError } = await supabase
          .from('tenants')
          .delete()
          .eq('tenant_id', tenantId);

        if (tenantError) {
          console.error(`Error deleting tenant ${tenantId}:`, tenantError);
          return;
        }

        await get().fetchTenants(true);
      },
      
      addProduct: async (productData) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot add product.');
          return null;
        }
        
        const dataToInsert = {
            ...productData,
            initial_stock: productData.stock,
        };

        const { data, error } = await supabase
          .from('products')
          .insert(dataToInsert)
          .select()
          .single();

        if (error) {
          console.error('Error adding product:', error, 'Object sent:', productData);
          return null;
        }
        
        if(data) {
           await get().fetchAllProducts(); // Refresh all products after adding
        }

        return data;
      },

      editProduct: async (productId, productData) => {
         if (!supabase) {
          console.error('Supabase not configured. Cannot edit product.');
          return;
        }

        const dataToUpdate = { ...productData };
        if (productData.stock !== undefined) {
            (dataToUpdate as Product).initial_stock = productData.stock;
        }


        const { data, error } = await supabase
          .from('products')
          .update(dataToUpdate)
          .eq('id', productId)
          .select()
          .single();
        
        if(error) {
            console.error('Error editing product:', error);
            return;
        }
        
        if (data) {
           await get().fetchAllProducts(); // Refresh all products after editing
        }
      },

      addStock: async (productId: string, quantity: number) => {
        if (!supabase || quantity <= 0) {
          return;
        }
         const { error } = await supabase.rpc('increment_product_stock', {
            p_product_id: productId,
            p_quantity_added: quantity,
        });

        if (error) {
            console.error('Error adding stock:', error);
            return;
        }

        await get().fetchAllProducts();
      },

      deleteProduct: async (productId: string) => {
        const productToDelete = get().products.find(p => p.id === productId);

        if (!productToDelete || !supabase) {
            console.error('Product not found or Supabase not configured.');
            return;
        }

        const { error } = await supabase.from('products').delete().eq('id', productId);

        if (error) {
            console.error('Error deleting product:', error);
            return;
        }
        await get().fetchAllProducts();
      },

      addCashier: async (name, pin, role) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot add cashier.');
          return false;
        }

        const { error } = await supabase.from('cashiers').insert({ name, pin, role });

        if (error) {
          console.error('Error adding cashier:', error);
          return false;
        }

        await get().fetchCashiers(true);
        return true;
      },
      
      editCashier: async (cashierId: string, data: Partial<Cashier>) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot edit cashier.');
          return false;
        }
        const { error } = await supabase
          .from('cashiers')
          .update(data)
          .eq('id', cashierId);

        if (error) {
          console.error('Error editing cashier:', error);
          return false;
        }
        await get().fetchCashiers(true);
        return true;
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
          transaction_id: o.transactionId
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
          return { success: false, syncedCount: 0, error: itemsError };
        }
        
        const syncedOrderIds = unsyncedOrders.map(o => o.id);
        get().markOrdersAsSynced(syncedOrderIds);

        return { success: true, syncedCount: unsyncedOrders.length };
      },

      setReportingDone: (isDone: boolean) => {
        set({ isReportingDone: isDone });
      },

      createEvent: async (eventData) => {
        if (!supabase) {
          console.error('Supabase not configured. Cannot create event.');
          return false;
        }
        const { error } = await supabase.from('events').insert(eventData);
        if (error) {
          console.error('Error creating event:', error);
          return false;
        }
        await get().fetchEvents(true); 
        return true;
      },

      setActiveEvent: async (eventId: number) => {
        if (!supabase) {
            console.error('Supabase not configured. Cannot set active event.');
            return;
        }
        const { error } = await supabase.rpc('set_active_event', { event_id_to_set: eventId });
        if (error) {
            console.error('Error setting active event:', JSON.stringify(error, null, 2));
            return;
        }
        await get().fetchEvents(true);
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
        events: state.events,
        activeEvent: state.activeEvent
      }),
    }
  )
);
