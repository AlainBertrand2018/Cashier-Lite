
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import ProductGrid from '@/components/product-grid';
import OrderSummary from '@/components/order-summary';
import Link from 'next/link';
import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams, useRouter } from 'next/navigation';
import ReceiptDialog from '@/components/receipt-dialog';

export default function TenantPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.tenantId as string;
  const { 
    activeAdmin,
    setSelectedTenantId, 
    lastCompletedOrder,
    resetToTenantSelection,
    fetchTenants,
    getTenantById,
  } = useStore();
  
  const tenant = getTenantById(parseInt(tenantId, 10));

  useEffect(() => {
    // This page is now primarily for ADMIN management.
    // Cashiers use the unified dashboard.
    if (!activeAdmin) {
      router.replace('/dashboard');
      return;
    }

    // Set the selected tenant in the store when the page loads
    fetchTenants();
    setSelectedTenantId(parseInt(tenantId, 10));
  }, [tenantId, setSelectedTenantId, fetchTenants, activeAdmin, router]);

  const isReceiptOpen = !!lastCompletedOrder;
  const setReceiptOpen = (isOpen: boolean) => {
    if (!isOpen) {
      resetToTenantSelection();
      router.push('/dashboard');
    }
  };
  
  // Render nothing if not an admin, as the useEffect will handle redirection.
  if (!activeAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/dashboard">
                <ArrowLeft />
                <span className="sr-only">Back to Dashboard</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {tenant ? `${tenant.name} (${tenant.responsibleParty} • ${tenant.mobile})` : 'Tenant'}
          </h1>
        </div>
        {activeAdmin && (
          <Button asChild variant="outline">
            <Link href={`/tenants/${tenantId}/manage`}>
              <Settings className="mr-2 h-4 w-4" />
              Manage Products
            </Link>
          </Button>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-7">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Product Management</h2>
          <ProductGrid />
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
