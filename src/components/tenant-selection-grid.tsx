'use client';

import { useStore } from '@/lib/store';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function TenantSelectionGrid() {
  const { products, setSelectedTenantId } = useStore();

  const tenants = Array.from(
    new Map(products.map((p) => [p.tenantId, { id: p.tenantId, name: p.tenantName }])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Select a Tenant</h1>
        <p className="text-muted-foreground mb-8">Choose the tenant to start a new order.</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {tenants.map((tenant) => (
            <Card
              key={tenant.id}
              onClick={() => setSelectedTenantId(tenant.id)}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105"
            >
              <CardHeader className="flex flex-col items-center justify-center text-center p-4 h-32">
                <CardTitle className="text-lg font-semibold">{tenant.name}</CardTitle>
                <p className="text-sm text-muted-foreground">ID: {tenant.id}</p>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
