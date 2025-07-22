
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { Logo } from '@/components/icons';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

function HeaderNavigation() {
  const [isClient, setIsClient] = useState(false);
  const { activeShift, logoutShift } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const pathname = usePathname();
  
  const navLinks = [
    { href: '/dashboard', label: 'New Order', icon: LayoutDashboard },
    { href: '/reports', label: 'End of Shift Ventilation', icon: BookOpen },
  ];
  
  const handleLogout = () => {
    logoutShift();
    router.push('/');
  }

  if (!isClient) {
    return null;
  }

  return (
    <>
      <TooltipProvider>
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 transition-colors hover:text-foreground',
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </TooltipProvider>
      <div className="ml-auto flex items-center gap-4">
        {activeShift && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserCircle className="h-5 w-5" />
            <span>{activeShift.cashierName}</span>
          </div>
        )}
         <Button variant="ghost" size="icon" onClick={handleLogout} title="End Shift & Logout">
            <LogOut className="h-4 w-4" />
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
