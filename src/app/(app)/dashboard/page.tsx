'use client';

import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { activeAdmin, setSelectedTenantId } = useStore();
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
              <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
              <p className="text-muted-foreground mb-8">You can add new tenants and manage existing ones.</p>
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
    </>
  );
}
