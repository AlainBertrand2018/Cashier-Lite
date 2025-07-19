'use client';

import ProductGrid from '@/components/product-grid';
import OrderSummary from '@/components/order-summary';
import ReceiptDialog from '@/components/receipt-dialog';
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [isClient, setIsClient] = useState(false);
  const { lastCompletedOrder, setLastCompletedOrder } = useStore();

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const isReceiptOpen = !!lastCompletedOrder;
  const setReceiptOpen = (isOpen: boolean) => {
    if (!isOpen) {
      setLastCompletedOrder(null);
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-5">
          <ProductGrid />
        </div>
        <div className="lg:col-span-2">
          <OrderSummary />
        </div>
      </div>
      <ReceiptDialog 
        isOpen={isReceiptOpen}
        onOpenChange={setReceiptOpen}
        order={lastCompletedOrder}
      />
    </>
  );
}
