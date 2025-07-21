
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, OrderItem, Order } from './types';

interface AppState {
  products: Product[];
  currentOrder: OrderItem[];
  completedOrders: Order[];
  lastCompletedOrder: Order | null;
  selectedTenantId: string | null;
  addProductToOrder: (product: Product) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  completeOrder: () => void;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
  setSelectedTenantId: (tenantId: string | null) => void;
  resetToTenantSelection: () => void;
  addTenant: (name: string) => string;
  addProduct: (name: string, price: number, tenantId: string) => void;
  editProduct: (productId: string, data: { name: string; price: number }) => void;
  deleteProduct: (productId: string) => void;
}

const initialProducts: Product[] = [
    // Mauritius Fried Chicken
    { id: 'mfc1', name: 'Large Spicy', price: 90.00, tenantId: 'T101', tenantName: 'Mauritius Fried Chicken' },
    { id: 'mfc2', name: 'Wings (5)', price: 80.00, tenantId: 'T101', tenantName: 'Mauritius Fried Chicken' },
    { id: 'mfc3', name: 'Mixed Platter', price: 200.00, tenantId: 'T101', tenantName: 'Mauritius Fried Chicken' },

    // Cannello Boulettes
    { id: 'cb1', name: 'Boulette Homard (10)', price: 200.00, tenantId: 'T102', tenantName: 'Cannello Boulettes' },
    { id: 'cb2', name: 'Boulette Crabe (10)', price: 125.00, tenantId: 'T102', tenantName: 'Cannello Boulettes' },
    { id: 'cb3', name: 'Mixed Bowl (20)', price: 300.00, tenantId: 'T102', tenantName: 'Cannello Boulettes' },

    // Nona Mada
    { id: 'nm1', name: 'Romazava', price: 200.00, tenantId: 'T103', tenantName: 'Nona Mada' },
    { id: 'nm2', name: 'Ravitoto', price: 200.00, tenantId: 'T103', tenantName: 'Nona Mada' },
    { id: 'nm3', name: 'Mofo Gasy (10)', price: 60.00, tenantId: 'T103', tenantName: 'Nona Mada' },
    { id: 'nm4', name: 'Mofo Akondro (10)', price: 80.00, tenantId: 'T103', tenantName: 'Nona Mada' },
    
    // Cuisines Réunionnaises
    { id: 'cr1', name: 'Rougail Saucisse', price: 200.00, tenantId: 'T104', tenantName: 'Cuisines Réunionnaises' },
    { id: 'cr2', name: 'Cabri Massalé', price: 200.00, tenantId: 'T104', tenantName: 'Cuisines Réunionnaises' },
    { id: 'cr3', name: 'Civet Zourite', price: 300.00, tenantId: 'T104', tenantName: 'Cuisines Réunionnaises' },
    { id: 'cr4', name: 'Gratin Chouchou', price: 180.00, tenantId: 'T104', tenantName: 'Cuisines Réunionnaises' },

    // La Renn SettKari
    { id: 'rsk1', name: '7 Kari Veg', price: 200.00, tenantId: 'T105', tenantName: 'La Renn SettKari' },
    { id: 'rsk2', name: '7 Kari Poul', price: 250.00, tenantId: 'T105', tenantName: 'La Renn SettKari' },
    { id: 'rsk3', name: '7 Kari Anyio', price: 300.00, tenantId: 'T105', tenantName: 'La Renn SettKari' },
    { id: 'rsk4', name: '7 Kari Pwason', price: 350.00, tenantId: 'T105', tenantName: 'La Renn SettKari' },
    
    // Arabian Delights
    { id: 'ad1', name: 'Couscous Agneau', price: 200.00, tenantId: 'T106', tenantName: 'Arabian Delights' },
    { id: 'ad2', name: 'Kebab Poulet', price: 250.00, tenantId: 'T106', tenantName: 'Arabian Delights' },
    { id: 'ad3', name: 'Tagine Marocain', price: 300.00, tenantId: 'T106', tenantName: 'Arabian Delights' },

    // Gadjak Soular
    { id: 'gs1', name: 'Pwason Fri ek so salad', price: 250.00, tenantId: 'T107', tenantName: 'Gadjak Soular' },
];


export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,
      selectedTenantId: null,

      setSelectedTenantId: (tenantId: string | null) => {
        // When changing tenants, clear the current order.
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

        const total = currentOrder.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const newOrder: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: selectedTenantId,
          items: currentOrder,
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

      markOrdersAsSynced: (orderIds) => {
        set((state) => ({
          completedOrders: state.completedOrders.map((order) => 
            orderIds.includes(order.id) ? { ...order, synced: true } : order
          )
        }))
      },

      addTenant: (name: string) => {
        const { products } = get();
        // Find all unique tenant names to prevent duplicates
        const tenantNames = Array.from(new Set(products.map(p => p.tenantName)));
        if (tenantNames.includes(name)) {
          // In a real app, you might want to return an error here
          console.error(`Tenant with name "${name}" already exists.`);
          const existingTenant = products.find(p => p.tenantName === name);
          return existingTenant?.tenantId || '';
        }

        const tenantIds = products.map(p => parseInt(p.tenantId.substring(1), 10));
        const maxId = Math.max(0, ...tenantIds);
        const newTenantId = `T${maxId + 1}`;
        
        // Add the new tenant by adding a placeholder "tenant existence" entry.
        // We'll add an empty product list entry so the tenant shows up in the grid.
        // This is a bit of a workaround because tenants are derived from products.
        // A better data model would have separate lists for tenants and products.
        const newTenantEntry: Product = {
          id: `tenant-ref-${newTenantId}`,
          name: '',
          price: 0,
          tenantId: newTenantId,
          tenantName: name,
        };
        
        set(state => ({
          products: [...state.products, newTenantEntry]
        }));
        
        return newTenantId;
      },

      addProduct: (name: string, price: number, tenantId: string) => {
        const { products } = get();
        const tenant = products.find(p => p.tenantId === tenantId);

        if (!tenant) {
          console.error(`Cannot add product. Tenant with ID ${tenantId} not found.`);
          return;
        }

        const newProduct: Product = {
          id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name,
          price,
          tenantId,
          tenantName: tenant.tenantName,
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
      partialize: (state) => ({ 
        completedOrders: state.completedOrders,
        products: state.products, // Persist new tenants and products
      }),
    }
  )
);
