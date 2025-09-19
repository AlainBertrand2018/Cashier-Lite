
'use client';

import AppHeader from '@/components/app-header';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  useEffect(() => {
    // Access the store only on the client-side within useEffect
    const { activeShift, activeAdmin } = useStore.getState();
    
    // Check if there's an active session (either shift or admin). If not, redirect to the login page.
    if (!activeShift && !activeAdmin) {
      router.replace('/');
    } else {
      setIsSessionChecked(true);
    }
  }, [router]);

  // Render a loading state or nothing until the session check is complete
  if (!isSessionChecked) {
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
    </div>
  );
}
