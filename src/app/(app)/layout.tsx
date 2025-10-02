
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
    // This effect ensures the loading screen is removed after hydration or a timeout.
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
    // This effect runs AFTER the loading screen is hidden.
    // It redirects only if we are certain there is no active session after hydration.
    if (_hasHydrated && !activeShift && !activeAdmin) {
      router.replace('/');
    }
  }, [_hasHydrated, activeShift, activeAdmin, router]);

  // Render a loading state until the store is hydrated or timeout is reached.
  if (showLoading) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // After loading, if state has hydrated and there is still no session,
  // render nothing while the useEffect above handles the redirect.
  // This prevents a flash of content before the redirect occurs.
  if (_hasHydrated && !activeShift && !activeAdmin) {
      return null;
  }

  // If hydration hasn't completed (e.g., on SUNMI), we still render the children
  // to avoid getting stuck. The user will see the logged-out state of the dashboard.
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
