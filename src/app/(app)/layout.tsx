
'use client';

import AppHeader from '@/components/app-header';
import AppFooter from '@/components/app-footer';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { activeShift, activeAdmin, _hasHydrated } = useStore();

  useEffect(() => {
    if (_hasHydrated && !activeShift && !activeAdmin) {
      router.replace('/');
    }
  }, [_hasHydrated, activeShift, activeAdmin, router]);

  // Wait until the store is rehydrated before rendering the app.
  if (!_hasHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  
  // If hydrated but no session, render nothing to avoid content flash during redirect.
  if (!activeShift && !activeAdmin) {
      return null;
  }

  // If a session exists, render the app.
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
