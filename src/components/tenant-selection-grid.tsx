
'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import AddTenantDialog from './add-tenant-dialog';
import Link from 'next/link';
import type { Tenant } from '@/lib/types';

function TenantCard({ tenant }: { tenant: Tenant }) {
  return (
    <Link href={`/tenants/${tenant.id}`} passHref>
      <Card className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-full flex flex-col justify-between">
        <CardContent className="flex flex-col items-center justify-center text-center p-4 flex-grow">
          <div className="text-6xl font-bold tracking-tighter mb-2">{tenant.id}</div>
          <div className="font-semibold text-lg">{tenant.name}</div>
          {tenant.mobile && (
            <div className="text-muted-foreground">{tenant.mobile}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}


export default function TenantSelectionGrid() {
  const tenants = useStore((state) => state.tenants.sort((a, b) => a.name.localeCompare(b.name)));
  const [isAddTenantOpen, setAddTenantOpen] = useState(false);

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Tenant</h1>
          <p className="text-muted-foreground mb-8">Choose the tenant to start a new order, or add a new one.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {tenants.map((tenant: Tenant) => (
              <TenantCard key={tenant.id} tenant={tenant} />
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
        </div>
      </div>
      <AddTenantDialog isOpen={isAddTenantOpen} onOpenChange={setAddTenantOpen} />
    </>
  );
}
