
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, LayoutDashboard, LogOut, Menu, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from './ui/separator';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


function NavigationLinks() {
  const pathname = usePathname();
  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reports', label: 'Reports', icon: BookOpen },
  ];

  return (
    <>
      {navLinks.map((link) => {
        const isActive = pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard');
        
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
              isActive && 'bg-muted text-primary'
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </>
  );
}

function UserInfoAndLogout() {
  const { 
    activeShift, 
    activeAdmin, 
    logoutShift, 
    adminLogout,
    isReportingDone,
    completedOrders
  } = useStore();
  const router = useRouter();

  const handleLogout = () => {
    if (activeShift) {
      logoutShift();
    }
    if (activeAdmin) {
      adminLogout();
    }
    router.push('/');
  };

  const isCashierLogoutDisabled = activeShift && completedOrders.length > 0 && !isReportingDone;
  const logoutTooltipMessage = "Complete end-of-shift reporting on the Reports page before logging out.";

  const LogoutButton = () => (
     <Button 
        variant="ghost" 
        onClick={handleLogout} 
        className="w-full justify-start gap-3 rounded-lg px-3 py-2"
        disabled={isCashierLogoutDisabled}
      >
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
  );

  return (
    <>
       <div className="flex items-center gap-2 text-sm font-medium">
        <UserCircle className="h-5 w-5" />
        <span className="truncate">{activeShift?.cashierName || activeAdmin?.email}</span>
      </div>
       {isCashierLogoutDisabled ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0} className="w-full"> 
                <LogoutButton />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{logoutTooltipMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <LogoutButton />
      )}
    </>
  );
}

export default function AppHeader() {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
         {/* Skeleton or minimal header for server render */}
       </header>
    );
  }


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col">
            <nav className="grid gap-2 text-lg font-medium">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-lg font-semibold mb-4"
              >
                <Image src="/images/logo_1024.webp" alt="FIDS Cashier Lite Logo" width={24} height={24} />
                <span>FIDS Cashier Lite</span>
              </Link>
              <NavigationLinks />
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              <Separator />
              <UserInfoAndLogout />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Navigation */}
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
        <Image src="/images/logo_1024.webp" alt="FIDS Cashier Lite Logo" width={24} height={24} />
        <span className="hidden md:inline-block">FIDS Cashier Lite</span>
      </Link>
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6 ml-6">
        <NavigationLinks />
      </nav>
      
      <div className="ml-auto hidden md:flex items-center gap-4">
         <UserInfoAndLogout />
      </div>
    </header>
  );
}
