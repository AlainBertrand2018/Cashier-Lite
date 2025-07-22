
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
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RevenueReport from '@/components/revenue-report';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Eraser } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { clearCompletedOrders, completedOrders } = useStore();
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResetShift = () => {
    clearCompletedOrders();
    setIsResetDialogOpen(false);
    toast({
      title: 'Shift Reset',
      description: 'All completed orders for this session have been cleared.',
    });
  };

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">End of Shift Report</h1>
                <p className="text-muted-foreground">Review sales data and manage the current shift.</p>
            </div>
             <Button 
                variant="destructive" 
                onClick={() => setIsResetDialogOpen(true)}
                disabled={completedOrders.length === 0}
            >
                <Eraser className="mr-2 h-4 w-4" />
                Reset Shift
            </Button>
        </div>
        <RevenueReport />
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
              {completedOrders.length} completed order(s) from this session.
              Synced orders will remain in the database, but all local records
              for this shift will be erased.
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
