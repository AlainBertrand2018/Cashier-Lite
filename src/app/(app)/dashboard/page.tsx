
'use client';

import AddCashierDialog from '@/components/add-cashier-dialog';
import CreateEventDialog from '@/components/create-event-dialog';
import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { useStore } from '@/lib/store';
import { Building, Calendar, DollarSign, PlusCircle, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Cashier, Event, Product, Tenant } from '@/lib/types';
import AddTenantDialog from '@/components/add-tenant-dialog';
import ManagementCard from '@/components/management-card';
import { Button } from '@/components/ui/button';
import ViewAllDialog from '@/components/view-all-dialog';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';

export default function DashboardPage() {
  const { 
    activeAdmin, 
    setSelectedTenantId,
    events,
    tenants,
    cashiers,
    products,
    fetchEvents,
    fetchTenants,
    fetchCashiers,
    fetchAllProducts,
    setActiveEvent,
  } = useStore();
  
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isAddCashierOpen, setIsAddCashierOpen] = useState(false);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);

  // View All Dialog states
  const [viewAllTitle, setViewAllTitle] = useState('');
  const [viewAllData, setViewAllData] = useState<any[]>([]);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);


  useEffect(() => {
    setIsClient(true);
    setSelectedTenantId(null);
    if (activeAdmin) {
      const loadAdminData = async () => {
        setIsLoading(true);
        await Promise.all([
          fetchEvents(true),
          fetchTenants(true),
          fetchCashiers(true),
          fetchAllProducts(),
        ]);
        setIsLoading(false);
      };
      loadAdminData();
    }
  }, [activeAdmin, setSelectedTenantId, fetchEvents, fetchTenants, fetchCashiers, fetchAllProducts]);

  const handleToggleActive = (eventId: number | undefined | null, newIsActive: boolean) => {
    if (newIsActive && eventId) {
      setActiveEvent(eventId);
    } else if (!eventId) {
        console.warn("Tried to set an active event with an invalid ID:", eventId);
    }
  };

  const handleViewAll = (title: string, data: any[], renderItem: (item: any) => React.ReactNode) => {
    setViewAllTitle(title);
    setViewAllData(data.map(item => ({ key: item.id || item.tenant_id, content: renderItem(item) })));
    setIsViewAllOpen(true);
  };
  
  const getTenantName = (tenantId: number) => {
    const tenant = tenants.find(t => t.tenant_id === tenantId);
    return tenant ? tenant.name : 'N/A';
  };


  if (!isClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex flex-col items-start p-4 gap-8">
        {activeAdmin ? (
          <>
            <div className="w-full">
               <div className="flex justify-start items-center mb-2 gap-4">
                  <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                </div>
                <p className="text-muted-foreground">Manage events, tenants, and cashiers.</p>
            </div>
            <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {/* Event Management Card */}
              <ManagementCard
                title="Events"
                description={`${events.length} total events`}
                icon={<Calendar />}
                actionButton={
                  <Button variant="outline" size="sm" onClick={() => setIsCreateEventOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Event
                  </Button>
                }
                onViewAll={() => handleViewAll('All Events', events, (item: Event) => 
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span>{item.name}</span>
                      <p className="text-xs text-muted-foreground">{new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}</p>
                    </div>
                     <Switch
                        checked={item.is_active}
                        onCheckedChange={(checked) => handleToggleActive(item.id, checked)}
                        aria-label={`Activate ${item.name}`}
                      />
                  </div>
                )}
                isLoading={isLoading}
              >
                {events.slice(0, 3).map(event => (
                  <li key={event.id} className="text-sm text-muted-foreground">{event.name}</li>
                ))}
              </ManagementCard>
              
              {/* Tenant Management Card */}
              <ManagementCard
                title="Tenants"
                description={`${tenants.length} total tenants`}
                icon={<Building />}
                actionButton={
                  <Button variant="outline" size="sm" onClick={() => setIsAddTenantOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Tenant
                  </Button>
                }
                 onViewAll={() => handleViewAll('All Tenants', tenants, (item: Tenant) => 
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-xs text-muted-foreground">ID: {item.tenant_id}</span>
                  </div>
                )}
                isLoading={isLoading}
              >
                {tenants.slice(0, 3).map(tenant => (
                  <li key={tenant.tenant_id} className="text-sm text-muted-foreground">{tenant.name}</li>
                ))}
              </ManagementCard>
              
              {/* Product Management Card */}
              <ManagementCard
                title="Products"
                description={`${products.length} total products`}
                icon={<DollarSign />}
                actionButton={
                  <Button asChild variant="outline" size="sm">
                    <Link href="#tenant-grid">
                      Add Product
                    </Link>
                  </Button>
                }
                 onViewAll={() => handleViewAll('All Products', products, (item: Product) => 
                  <div className="flex justify-between items-center w-full">
                    <div>
                      <span>{item.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {getTenantName(item.tenant_id)} • Rs {item.selling_price.toFixed(2)}
                      </p>
                    </div>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-md">Stock: {item.stock}</span>
                  </div>
                )}
                isLoading={isLoading}
              >
                 {products.slice(0, 3).map(product => (
                  <li key={product.id} className="text-sm text-muted-foreground">{product.name}</li>
                ))}
              </ManagementCard>
              
              {/* Cashier Management Card */}
              <ManagementCard
                title="Cashiers"
                description={`${cashiers.length} total cashiers`}
                icon={<Users />}
                actionButton={
                  <Button variant="outline" size="sm" onClick={() => setIsAddCashierOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Cashier
                  </Button>
                }
                 onViewAll={() => handleViewAll('All Cashiers', cashiers, (item: Cashier) => 
                  <div className="flex justify-between items-center">
                    <span>{item.name}</span>
                  </div>
                )}
                isLoading={isLoading}
              >
                 {cashiers.slice(0, 3).map(cashier => (
                  <li key={cashier.id} className="text-sm text-muted-foreground">{cashier.name}</li>
                ))}
              </ManagementCard>
            </div>
            <div id="tenant-grid" className="w-full">
                <h2 className="text-2xl font-bold tracking-tight mb-2">Tenant Management</h2>
                <p className="text-muted-foreground mb-4">Select a tenant to manage their products.</p>
                <TenantSelectionGrid />
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
      <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setIsAddTenantOpen} />
       <ViewAllDialog 
        isOpen={isViewAllOpen}
        onOpenChange={setIsViewAllOpen}
        title={viewAllTitle}
        items={viewAllData}
      />
    </>
  );
}
