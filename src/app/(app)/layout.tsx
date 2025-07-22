
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
  const { activeShift } = useStore();
  const router = useRouter();
  const [isShiftChecked, setIsShiftChecked] = useState(false);

  useEffect(() => {
    // Check if there's an active shift. If not, redirect to the login page.
    if (!activeShift) {
      router.replace('/');
    } else {
      setIsShiftChecked(true);
    }
  }, [activeShift, router]);

  // Render a loading state or nothing until the shift check is complete
  if (!isShiftChecked) {
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
