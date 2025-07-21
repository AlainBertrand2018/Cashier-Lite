'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import ProductGrid from '@/components/product-grid';
import OrderSummary from '@/components/order-summary';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';

export default function TenantPage() {
  const params = useParams();
  const tenantId = params.tenantId as string;
  const { setSelectedTenantId, products } = useStore();

  useEffect(() => {
    // Set the selected tenant in the store when the page loads
    setSelectedTenantId(tenantId);
  }, [tenantId, setSelectedTenantId]);

  const tenant = products.find(p => p.tenantId === tenantId);
  const tenantName = tenant ? tenant.tenantName : 'Tenant';

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-5">
          <ProductGrid />
        </div>
        <div className="lg:col-span-2">
          <OrderSummary />
        </div>
      </div>
    </>
  );
}
