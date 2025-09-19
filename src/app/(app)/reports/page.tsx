
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Check, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import RevenueReport from '@/components/revenue-report';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';


export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);
  const { completedOrders, isReportingDone, setReportingDone, logoutShift, activeAdmin, getActiveEvent, fetchEvents } = useStore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
    if(!activeAdmin) {
      fetchEvents();
    }
  }, [activeAdmin, fetchEvents]);

  const activeEvent = getActiveEvent();

  const handleLogout = () => {
    logoutShift();
    router.push('/');
     toast({
      title: 'Shift Ended',
      description: 'You have been successfully logged out.',
    });
  }

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <>
       <div className="space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{activeAdmin ? 'Overall Performance Report' : 'End of Shift Report'}</h1>
                <p className="text-muted-foreground">
                    {activeAdmin ? 'Review overall sales data across all tenants.' : 'Review sales data and manage the current shift.'}
                </p>
                 {activeEvent && (
                    <p className="text-sm text-primary font-semibold mt-1">
                        Event: {activeEvent.name} ({format(new Date(activeEvent.start_date), 'dd/MM/yy')} - {format(new Date(activeEvent.end_date), 'dd/MM/yy')})
                    </p>
                 )}
            </div>
            {!activeAdmin && (
                <div className="flex gap-2">
                    <Button 
                        variant="outline" 
                        onClick={() => setReportingDone(true)}
                        disabled={completedOrders.length === 0 || isReportingDone}
                    >
                        <Check className="mr-2 h-4 w-4" />
                        {isReportingDone ? 'Reporting Confirmed' : 'Reporting Done'}
                    </Button>
                    <Button 
                        variant="destructive"
                        onClick={handleLogout}
                        disabled={!isReportingDone}
                        title={!isReportingDone ? "Mark 'Reporting Done' before ending the shift." : "End shift and logout"}
                        >
                        <LogOut className="mr-2 h-4 w-4" />
                        End Shift
                    </Button>
                </div>
            )}
        </div>
        <RevenueReport />
      </div>
    </>
  );
}
