
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
  const { activeAdmin } = useStore();
  const href = activeAdmin ? `/tenants/${tenant.tenant_id}/manage` : `/tenants/${tenant.tenant_id}`;
  
  return (
    <Link href={href} passHref>
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-full flex flex-col justify-between">
        <CardContent className="flex flex-col items-center justify-center text-center p-4 flex-grow">
          <div className="text-7xl font-extrabold tracking-tighter mb-4">{tenant.tenant_id}</div>
          <div className="font-semibold text-xl mb-2">{tenant.name}</div>
          {tenant.mobile && (
            <div className="text-muted-foreground text-lg">{tenant.mobile}</div>
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
  const {tenants, fetchTenants, activeAdmin} = useStore();
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
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? <TenantGridSkeleton /> : sortedTenants.map((tenant) => (
              <TenantCard key={tenant.tenant_id} tenant={tenant} />
            ))}
            {activeAdmin && !isLoading && (
                <Card
                onClick={() => setAddTenantOpen(true)}
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary min-h-[180px]"
                >
                <CardContent className="flex flex-col items-center justify-center text-center p-4">
                    <PlusCircle className="h-10 w-10 mb-2" />
                    <div className="text-lg font-semibold">Add Tenant</div>
                </CardContent>
                </Card>
            )}
        </div>
      <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setAddTenantOpen} />
    </>
  );
}
