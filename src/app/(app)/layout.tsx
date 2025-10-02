
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
    // Hide loading screen after rehydration or a timeout
    if (_hasHydrated) {
      setShowLoading(false);
    } else {
      const timer = setTimeout(() => {
        setShowLoading(false);
      }, 2000); // 2-second fallback
      return () => clearTimeout(timer);
    }
  }, [_hasHydrated]);

  useEffect(() => {
    // Only perform the check after the store has been rehydrated.
    if (_hasHydrated) {
      // Check if there's an active session (either shift or admin). 
      // If not, redirect to the login page.
      if (!activeShift && !activeAdmin) {
        router.replace('/');
      }
    }
  }, [_hasHydrated, activeShift, activeAdmin, router]);

  // Render a loading state until the store is hydrated and the session is confirmed.
  if (showLoading || !_hasHydrated || (!activeShift && !activeAdmin)) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
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
