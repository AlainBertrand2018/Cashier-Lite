'use client';

import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';
import ReceiptDialog from '@/components/receipt-dialog';

export default function DashboardPage() {
  // This effect resets the selected tenant when the user navigates back to the dashboard.
  useEffect(() => {
    useStore.getState().setSelectedTenantId(null);
  }, []);

  const lastCompletedOrder = useStore((state) => state.lastCompletedOrder);
  const resetToTenantSelection = useStore((state) => state.resetToTenantSelection);
  
  const isReceiptOpen = !!lastCompletedOrder;
  const setReceiptOpen = (isOpen: boolean) => {
    if (!isOpen) {
      resetToTenantSelection();
    }
  };

  return (
    <>
      <TenantSelectionGrid />
      <ReceiptDialog 
        isOpen={isReceiptOpen}
        onOpenChange={setReceiptOpen}
        order={lastCompletedOrder}
      />
    </>
  );
}
