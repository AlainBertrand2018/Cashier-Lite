
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
    setSelectedTenantId, 
    lastCompletedOrder,
    resetToTenantSelection,
    fetchTenants
  } = useStore();

  const [tenantName, setTenantName] = useState('Tenant');
  
  const tenant = useStore((state) => state.getTenantById(parseInt(tenantId, 10)));

  useEffect(() => {
    // Set the selected tenant in the store when the page loads
    fetchTenants();
    setSelectedTenantId(parseInt(tenantId, 10));
  }, [tenantId, setSelectedTenantId, fetchTenants]);

  useEffect(() => {
    if (tenant) {
      setTenantName(tenant.name);
    }
  }, [tenant]);

  const isReceiptOpen = !!lastCompletedOrder;
  const setReceiptOpen = (isOpen: boolean) => {
    if (!isOpen) {
      resetToTenantSelection();
      router.push('/dashboard');
    }
  };

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
            {tenantName}
          </h1>
        </div>
        <Button asChild variant="outline">
          <Link href={`/tenants/${tenantId}/manage`}>
            <Settings className="mr-2 h-4 w-4" />
            Manage Products
          </Link>
        </Button>
      </div>
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
