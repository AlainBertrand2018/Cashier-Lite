'use client';

import AddCashierDialog from '@/components/add-cashier-dialog';
import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { activeAdmin, setSelectedTenantId } = useStore();
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);

  // This effect resets the selected tenant when the user navigates back to the dashboard.
  useEffect(() => {
    setSelectedTenantId(null);
  }, [setSelectedTenantId]);

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          {activeAdmin ? (
            <>
              <div className="flex justify-center items-center mb-2 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                <Button variant="outline" onClick={() => setIsAddCashierOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Cashier
                </Button>
              </div>
              <p className="text-muted-foreground mb-8">You can add new tenants, manage existing ones, and create cashier profiles.</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Tenant</h1>
              <p className="text-muted-foreground mb-8">Choose the tenant to start a new order, or add a new one.</p>
            </>
          )}
          <TenantSelectionGrid />
        </div>
      </div>
      <AddCashierDialog isOpen={isAddCashierOpen} onOpenChange={setIsAddCashierOpen} />
    </>
  );
}
