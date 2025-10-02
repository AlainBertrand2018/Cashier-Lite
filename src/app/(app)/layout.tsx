
'use client';

import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeShift, activeAdmin, _hasHydrated } = useStore();
  const [showLoading, setShowLoading] = useState(true);


  useEffect(() => {
    // Hide loading screen after rehydration is attempted.
    if (_hasHydrated) {
      setShowLoading(false);
    } else {
      // Fallback for devices where rehydration might fail/stall.
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000); 
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    // Only perform the redirect check after the initial loading phase is over.
    if (!showLoading) {
      if (!activeShift && !activeAdmin) {
        router.replace('/');
      }
    }
  }, [showLoading, activeShift, activeAdmin, router]);

  // Render a loading state until the store is hydrated or timeout is reached.
  if (showLoading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If not loading, but session is invalid, render nothing and let useEffect handle redirect.
  if (!activeShift && !activeAdmin) {
      return null;
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
