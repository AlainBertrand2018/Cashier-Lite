
'use client';

import AddCashierDialog from '@/components/add-cashier-dialog';
import CreateEventDialog from '@/components/create-event-dialog';
import EventManagementCard from '@/components/event-management-card';
import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { CalendarPlus, PlusCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { activeAdmin, setSelectedTenantId } = useStore();
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);

  // This effect resets the selected tenant when the user navigates back to the dashboard.
  useEffect(() => {
    setSelectedTenantId(null);
  }, [setSelectedTenantId]);

  return (
    <>
      <div className="flex-1 flex flex-col items-start p-4 gap-8">
        {activeAdmin ? (
          <>
            <div className="w-full">
               <div className="flex justify-start items-center mb-2 gap-4">
                  <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                  <Button variant="outline" onClick={() => setIsAddCashierOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Cashier
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateEventOpen(true)}>
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Create Event
                  </Button>
                </div>
                <p className="text-muted-foreground">Manage events, tenants, and cashiers.</p>
            </div>
            <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
              <EventManagementCard />
              <div className="lg:col-span-1">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Tenant Management</h2>
                <p className="text-muted-foreground mb-4">Select a tenant to manage their products.</p>
                <TenantSelectionGrid />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full max-w-4xl text-center mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Tenant</h1>
            <p className="text-muted-foreground mb-8">Choose the tenant to start a new order.</p>
            <TenantSelectionGrid />
          </div>
        )}
      </div>
      <AddCashierDialog isOpen={isAddCashierOpen} onOpenChange={setIsAddCashierOpen} />
      <CreateEventDialog isOpen={isCreateEventOpen} onOpenChange={setIsCreateEventOpen} />
    </>
  );
}
