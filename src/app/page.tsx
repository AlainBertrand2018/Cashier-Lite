
'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/login-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
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
import { Eraser } from 'lucide-react';
import Image from 'next/image';
import AppFooter from '@/components/app-footer';

export default function LoginPage() {
  const { activeShift, activeAdmin, isReportingDone, clearCompletedOrders, completedOrders, _hasHydrated } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated && (activeShift || activeAdmin)) {
        router.replace('/dashboard');
    }
  }, [_hasHydrated, activeShift, activeAdmin, router]);
  
  const handleResetShift = () => {
    clearCompletedOrders();
    setIsResetDialogOpen(false);
    toast({
      title: 'Shift Reset',
      description: 'All completed orders for the previous session have been cleared.',
    });
  };
  
  // Wait until the store is rehydrated.
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If hydrated and logged in, render null to prevent flash of login page during redirect.
  if (activeShift || activeAdmin) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Image
                  src="/images/logo_1024.webp"
                  alt="FIDS Cashier Lite Logo"
                  width={64}
                  height={64}
                  className="mx-auto mb-4"
                />
                <h1 className="text-3xl font-bold tracking-tight">Cashier Lite</h1>
                <p className="text-muted-foreground">Revenue Sharing Cashing and Reporting System</p>
            </div>

            <LoginForm />
            
            <div className="border-t pt-6 text-center">
                 <Button 
                    variant="destructive" 
                    onClick={() => setIsResetDialogOpen(true)}
                    disabled={completedOrders.length === 0 || !isReportingDone}
                    title={!isReportingDone ? "Reporting must be marked as 'Done' from the reports page before a new reset." : "Reset all shift data"}
                >
                    <Eraser className="mr-2 h-4 w-4" />
                    Reset Previous Shift
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    {completedOrders.length > 0 && !isReportingDone 
                    ? "Go to Reports page to complete end-of-shift reporting."
                    : "Use this to clear data from a previous shift before starting a new one."
                    }
                </p>
            </div>
        </div>
      </div>
      <AppFooter />
      <AlertDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently clear all{' '}
              {completedOrders.length} completed order(s) from the previous session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetShift}>
              Yes, reset shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
