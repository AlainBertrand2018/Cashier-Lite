
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
  selectedTenantId: string | null;
  fetchTenants: () => Promise<void>;
  addProductToOrder: (product: Product) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  completeOrder: () => void;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: string | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (tenantData: Omit<Tenant, 'id' | 'createdAt'>) => Promise<string | null>;
  addProduct: (name: string, price: number, tenantId: string) => void;
  editProduct: (productId: string, data: { name: string; price: number }) => void;
  deleteProduct: (productId: string) => void;
  getTenantById: (tenantId: string | null) => Tenant | undefined;
}

const initialProducts: Omit<Product, 'tenantName'>[] = [
    // Mauritius Fried Chicken
    { id: 'mfc1', name: 'Large Spicy', price: 90.00, tenantId: '101' },
    { id: 'mfc2', name: 'Wings (5)', price: 80.00, tenantId: '101' },
    { id: 'mfc3', name: 'Mixed Platter', price: 200.00, tenantId: '101' },

    // Cannello Boulettes
    { id: 'cb1', name: 'Boulette Homard (10)', price: 200.00, tenantId: '102' },
    { id: 'cb2', name: 'Boulette Crabe (10)', price: 125.00, tenantId: '102' },
    { id: 'cb3', name: 'Mixed Bowl (20)', price: 300.00, tenantId: '102' },

    // Nona Mada
    { id: 'nm1', name: 'Romazava', price: 200.00, tenantId: '103' },
    { id: 'nm2', name: 'Ravitoto', price: 200.00, tenantId: '103' },
    { id: 'nm3', name: 'Mofo Gasy (10)', price: 60.00, tenantId: '103' },
    { id: 'nm4', name: 'Mofo Akondro (10)', price: 80.00, tenantId: '103' },
    
    // Cuisines Réunionnaises
    { id: 'cr1', name: 'Rougail Saucisse', price: 200.00, tenantId: '104' },
    { id: 'cr2', name: 'Cabri Massalé', price: 200.00, tenantId: '104' },
    { id: 'cr3', name: 'Civet Zourite', price: 300.00, tenantId: '104' },
    { id: 'cr4', name: 'Gratin Chouchou', price: 180.00, tenantId: '104' },

    // La Renn SettKari
    { id: 'rsk1', name: '7 Kari Veg', price: 200.00, tenantId: '105' },
    { id: 'rsk2', name: '7 Kari Poul', price: 250.00, tenantId: '105' },
    { id: 'rsk3', name: '7 Kari Anyio', price: 300.00, tenantId: '105' },
    { id: 'rsk4', name: '7 Kari Pwason', price: 350.00, tenantId: '105' },
    
    // Arabian Delights
    { id: 'ad1', name: 'Couscous Agneau', price: 200.00, tenantId: '106' },
    { id: 'ad2', name: 'Kebab Poulet', price: 250.00, tenantId: '106' },
    { id: 'ad3', name: 'Tagine Marocain', price: 300.00, tenantId: '106' },

    // Gadjak Soular
    { id: 'gs1', name: 'Pwason Fri ek so salad', price: 250.00, tenantId: '107' },
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
        const { data, error } = await supabase.from('tenants').select();
        if (error) {
          console.error('Error fetching tenants:', error);
          return;
        }
        set({ tenants: data || [] });
      },

      getTenantById: (tenantId: string | null) => {
        if (!tenantId) return undefined;
        return get().tenants.find(t => t.id === tenantId);
      },

      setSelectedTenantId: (tenantId: string | null) => {
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

        return data?.id || null;
      },

      addProduct: (name: string, price: number, tenantId: string) => {
        const { tenants } = get();
        const tenant = tenants.find(t => t.id === tenantId);

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
      // We only persist data that is not fetched from the DB
      partialize: (state) => ({ 
        completedOrders: state.completedOrders,
        products: state.products,
        // tenants are now fetched from supabase
      }),
    }
  )
);
