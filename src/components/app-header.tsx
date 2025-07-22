
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RefreshCw, BookOpen, LayoutDashboard } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';

function HeaderNavigation() {
  const [isClient, setIsClient] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  const unsyncedCount = useStore(state => state.completedOrders.filter(o => !o.synced).length);
  const syncOrders = useStore(state => state.syncOrders);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsSyncing(true);
    toast({
      title: 'Syncing...',
      description: `Attempting to sync ${unsyncedCount} orders.`,
    });
    
    const { success, syncedCount, error } = await syncOrders();

    setIsSyncing(false);
    
    if (success) {
      toast({
        title: 'Sync Complete',
        description: `${syncedCount} orders were successfully synced.`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Sync Failed',
        description: `Could not sync orders. Please check console for details.`,
      });
       console.error("Sync error details:", error);
    }
  };
  
  const navLinks = [
    { href: '/dashboard', label: 'New Order', icon: LayoutDashboard, disabled: false },
    { href: '/reports', label: 'End of Shift Ventilation', icon: BookOpen, disabled: unsyncedCount > 0 },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const linkContent = (
              <Link
                key={link.href}
                href={link.disabled ? '#' : link.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground',
                  isActive && !link.disabled ? 'text-foreground' : 'text-muted-foreground',
                  link.disabled && 'pointer-events-none text-muted-foreground/50'
                )}
                aria-disabled={link.disabled}
                tabIndex={link.disabled ? -1 : undefined}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );

            if (link.disabled) {
              return (
                <Tooltip key={link.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent>
                    <p>Sync all data to view reports.</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return linkContent;
          })}
        </nav>
      </TooltipProvider>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleSync} disabled={unsyncedCount === 0 || isSyncing}>
          <RefreshCw className={cn('mr-2 h-4 w-4', isSyncing && 'animate-spin')} />
          {isSyncing ? 'Syncing...' : 'Sync Data'}
          {unsyncedCount > 0 && !isSyncing && (
            <Badge variant="secondary" className="ml-2">
              {unsyncedCount}
            </Badge>
          )}
        </Button>
      </div>
    </>
  );
}


export default function AppHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Logo className="h-6 w-6 text-primary" />
        <span className="">FIDS Cashier Lite</span>
      </Link>
      <HeaderNavigation />
    </header>
  );
}

    