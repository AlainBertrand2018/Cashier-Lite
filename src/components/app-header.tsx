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


export default function AppHeader() {
  const pathname = usePathname();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  
  const unsyncedCount = useStore(state => 
    isClient ? state.completedOrders.filter(o => !o.synced).length : 0
  );

  useEffect(() => {
    setIsClient(true);
  }, []);


  const handleSync = () => {
    toast({
      title: 'Syncing...',
      description: `Attempting to sync ${unsyncedCount} orders. (Sync logic not yet implemented)`,
    });
  };

  if (!isClient) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* Render a skeleton or minimal header during SSR */}
         <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo className="h-6 w-6 text-primary" />
          <span className="">FIDS Cashier Lite</span>
        </Link>
      </header>
    );
  }

  const navLinks = [
    { href: '/dashboard', label: 'New Order', icon: LayoutDashboard, disabled: false },
    { href: '/reports', label: 'End of Shift Ventilation', icon: BookOpen, disabled: unsyncedCount > 0 },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Logo className="h-6 w-6 text-primary" />
        <span className="">FIDS Cashier Lite</span>
      </Link>
      <TooltipProvider>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {navLinks.map((link) => {
            const linkContent = (
              <Link
                key={link.href}
                href={link.disabled ? '#' : link.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground',
                  pathname === link.href && !link.disabled ? 'text-foreground' : 'text-muted-foreground',
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
        <Button variant="outline" size="sm" onClick={handleSync} disabled={unsyncedCount === 0}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync Data
          {unsyncedCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {unsyncedCount}
            </Badge>
          )}
        </Button>
      </div>
    </header>
  );
}
