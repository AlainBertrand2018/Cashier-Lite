'use client';

import RevenueReport from '@/components/revenue-report';
import { useEffect, useState } from 'react';

export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold tracking-tight">Shift Reports</h1>
      <RevenueReport />
    </div>
  );
}
