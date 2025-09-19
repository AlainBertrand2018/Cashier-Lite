
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, Trash2 } from 'lucide-react';
import AddTenantDialog from './add-tenant-dialog';
import Link from 'next/link';
import type { Tenant } from '@/lib/types';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function TenantCard({ tenant, onDelete }: { tenant: Tenant, onDelete: (tenant: Tenant) => void }) {
  const { activeAdmin } = useStore();
  const href = activeAdmin ? `/tenants/${tenant.tenant_id}/manage` : `/tenants/${tenant.tenant_id}`;
  
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    onDelete(tenant);
  };

  return (
    <Card className="relative group/tenant-card cursor-pointer transition-all hover:shadow-lg hover:scale-105 h-full flex flex-col justify-between">
      {activeAdmin && (
        <Button 
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover/tenant-card:opacity-100 transition-opacity z-10"
          onClick={handleDeleteClick}
          aria-label={`Delete tenant ${tenant.name}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <Link href={href} passHref className="absolute inset-0 z-0">
        <span className="sr-only">View tenant {tenant.name}</span>
      </Link>
      <CardContent className="flex flex-col items-center justify-center text-center p-4 flex-grow">
        <div className="text-7xl font-extrabold tracking-tighter mb-4">{tenant.tenant_id}</div>
        <div className="font-semibold text-xl mb-2">{tenant.name}</div>
        {tenant.mobile && (
          <div className="text-muted-foreground text-lg">{tenant.mobile}</div>
        )}
      </CardContent>
    </Card>
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
  const {tenants, fetchTenants, activeAdmin, deleteTenant} = useStore();
  const [isAddTenantOpen, setAddTenantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  useEffect(() => {
    const loadTenants = async () => {
        setIsLoading(true);
        await fetchTenants();
        setIsLoading(false);
    }
    loadTenants();
  }, [fetchTenants]);

  const handleDeleteRequest = (tenant: Tenant) => {
    setTenantToDelete(tenant);
  };

  const confirmDelete = async () => {
    if (tenantToDelete) {
      await deleteTenant(tenantToDelete.tenant_id);
      setTenantToDelete(null);
    }
  };

  const sortedTenants = [...tenants].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading ? <TenantGridSkeleton /> : sortedTenants.map((tenant) => (
              <TenantCard key={tenant.tenant_id} tenant={tenant} onDelete={handleDeleteRequest} />
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
       <AlertDialog
        open={!!tenantToDelete}
        onOpenChange={(isOpen) => !isOpen && setTenantToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              tenant "{tenantToDelete?.name}" and all of its associated products.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
