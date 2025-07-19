'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, OrderItem, Order } from './types';

interface AppState {
  products: Product[];
  currentOrder: OrderItem[];
  completedOrders: Order[];
  lastCompletedOrder: Order | null;
  addProductToOrder: (product: Product) => void;
  removeProductFromOrder: (productId: string) => void;
  updateProductQuantity: (productId: string, quantity: number) => void;
  clearCurrentOrder: () => void;
  completeOrder: () => void;
  setLastCompletedOrder: (order: Order | null) => void;
  markOrdersAsSynced: (orderIds: string[]) => void;
}

const initialProducts: Product[] = [
    { id: '1', name: 'Jollof Rice & Chicken', price: 15.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'jollof rice', tenantId: '101', tenantName: 'Ghanaian Delights' },
    { id: '2', name: 'Fried Rice & Beef', price: 16.50, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'fried rice', tenantId: '101', tenantName: 'Ghanaian Delights' },
    { id: '3', name: 'Waakye with Sides', price: 12.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'waakye ghana', tenantId: '101', tenantName: 'Ghanaian Delights' },
    { id: '4', name: 'Banku & Tilapia', price: 20.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'banku tilapia', tenantId: '101', tenantName: 'Ghanaian Delights' },
    { id: '5', name: 'Kelewele', price: 5.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'kelewele spicy', tenantId: '102', tenantName: 'Spicy Bites' },
    { id: '6', name: 'Fufu & Light Soup', price: 18.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'fufu soup', tenantId: '101', tenantName: 'Ghanaian Delights' },
    { id: '7', name: 'Club Beer', price: 3.50, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'beer bottle', tenantId: '103', tenantName: 'Local Drinks' },
    { id: '8', name: 'Bissap Drink', price: 2.50, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'hibiscus drink', tenantId: '103', tenantName: 'Local Drinks' },
    { id: '9', name: 'Bottled Water', price: 1.00, imageUrl: 'https://placehold.co/300x200.png', "data-ai-hint": 'water bottle', tenantId: '103', tenantName: 'Local Drinks' },
];


export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      currentOrder: [],
      completedOrders: [],
      lastCompletedOrder: null,

      addProductToOrder: (product) => {
        const { currentOrder } = get();
        
        // Ensure all items in the order are from the same tenant
        if (currentOrder.length > 0 && currentOrder[0].tenantId !== product.tenantId) {
          // In a real app, you might show a toast notification here.
          // For now, we'll just log an error and prevent the action.
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
        const { currentOrder } = get();
        if (currentOrder.length === 0) return;

        const total = currentOrder.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        const newOrder: Order = {
          id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          tenantId: currentOrder[0].tenantId, // All items are from the same tenant
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
      }

    }),
    {
      name: 'fids-cashier-lite-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist completed orders to prevent data loss.
      // Current order is ephemeral.
      partialize: (state) => ({ completedOrders: state.completedOrders }),
    }
  )
);
