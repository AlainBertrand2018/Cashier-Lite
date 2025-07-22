
'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/login-form';
import { Logo } from '@/components/icons';
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
import { useState } from 'react';
import { Eraser } from 'lucide-react';

export default function LoginPage() {
  const { activeShift, isReportingDone, clearCompletedOrders, completedOrders } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    if (activeShift) {
      router.replace('/dashboard');
    }
  }, [activeShift, router]);

  const handleResetShift = () => {
    clearCompletedOrders();
    setIsResetDialogOpen(false);
    toast({
      title: 'Shift Reset',
      description: 'All completed orders for the previous session have been cleared.',
    });
  };
  
  // Don't render anything until the check is complete to avoid flicker
  if (activeShift) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-md space-y-8">
            <div className="text-center">
                <Logo className="mx-auto h-16 w-16 text-primary mb-4" />
                <h1 className="text-3xl font-bold tracking-tight">FIDS Cashier Lite</h1>
                <p className="text-muted-foreground">Please start a new shift to continue.</p>
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
