
'use client';

import { useStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import TenantReport from '@/components/tenant-report';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TenantReportPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenantId as string, 10);
  
  const { tenants, completedOrders, fetchTenants } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    fetchTenants();
  }, [fetchTenants]);

  const tenant = tenants.find(t => t.tenant_id === tenantId);
  const tenantOrders = completedOrders.filter(o => o.tenantId === tenantId);

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p>Tenant not found.</p>
        <Button asChild variant="outline">
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Reports
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
       <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/reports/all-tenants">
            <ArrowLeft />
            <span className="sr-only">Back to All Reports</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tenant Sales Report</h1>
          <p className="text-muted-foreground">Detailed report for {tenant.name}</p>
        </div>
      </div>
      <TenantReport tenant={tenant} orders={tenantOrders} />
    </div>
  );
}
