
'use client';

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
import { useStore } from '@/lib/store';
import { useEffect, useState } from 'react';

// This component is now effectively deprecated by the multi-tenant cart feature.
// It is kept in the project to avoid breaking imports, but its functionality is no longer triggered.
export default function ConfirmTenantSwitchDialog() {
  const { 
    productForTenantSwitch, 
    setProductForTenantSwitch, 
    startNewOrderWithProduct,
    getTenantById
  } = useStore();
  
  const [tenantName, setTenantName] = useState('');

  const tenant = getTenantById(productForTenantSwitch?.tenant_id || null);

  useEffect(() => {
    if (tenant) {
        setTenantName(tenant.name);
    }
  }, [tenant]);

  const isOpen = !!productForTenantSwitch;

  const handleConfirm = () => {
    if (productForTenantSwitch) {
      startNewOrderWithProduct(productForTenantSwitch);
    }
  };

  const handleCancel = () => {
    setProductForTenantSwitch(null);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Start a New Order?</AlertDialogTitle>
          <AlertDialogDescription>
            This will clear your current order and start a new one for{' '}
            <span className="font-bold text-foreground">{tenantName}</span>. 
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Yes, Start New Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    