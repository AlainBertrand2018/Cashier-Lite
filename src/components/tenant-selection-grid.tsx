
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import AddTenantDialog from './add-tenant-dialog';
import Link from 'next/link';
import type { Tenant } from '@/lib/types';
import { Skeleton } from './ui/skeleton';

function TenantCard({ tenant }: { tenant: Tenant }) {
  return (
    <Link href={`/tenants/${tenant.tenant_id}`} passHref>
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-full flex flex-col justify-between">
        <CardContent className="flex flex-col items-center justify-center text-center p-4 flex-grow">
          <div className="text-6xl font-bold tracking-tighter mb-2">{tenant.tenant_id}</div>
          <div className="font-semibold text-lg">{tenant.name}</div>
          {tenant.mobile && (
            <div className="text-muted-foreground">{tenant.mobile}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function TenantGridSkeleton() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="min-h-[180px] flex flex-col justify-center items-center">
                    <CardContent className="flex flex-col items-center justify-center text-center p-4">
                        <Skeleton className="h-16 w-24 mb-4" />
                        <Skeleton className="h-6 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function TenantSelectionGrid() {
  const {tenants, fetchTenants} = useStore((state) => ({tenants: state.tenants, fetchTenants: state.fetchTenants}));
  const [isAddTenantOpen, setAddTenantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTenants = async () => {
        setIsLoading(true);
        await fetchTenants();
        setIsLoading(false);
    }
    loadTenants();
  }, [fetchTenants]);

  const sortedTenants = [...tenants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Tenant</h1>
          <p className="text-muted-foreground mb-8">Choose the tenant to start a new order, or add a new one.</p>
          {isLoading ? <TenantGridSkeleton /> : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {sortedTenants.map((tenant: Tenant) => (
                  <TenantCard key={tenant.tenant_id} tenant={tenant} />
                ))}
                <Card
                onClick={() => setAddTenantOpen(true)}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary min-h-[180px]"
                >
                <CardContent className="flex flex-col items-center justify-center text-center p-4">
                    <PlusCircle className="h-10 w-10 mb-2" />
                    <div className="text-lg font-semibold">Add Tenant</div>
                </CardContent>
                </Card>
            </div>
          )}
        </div>
      </div>
      <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setAddTenantOpen} />
    </>
  );
}
