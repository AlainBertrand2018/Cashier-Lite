'use client';

import TenantSelectionGrid from '@/components/tenant-selection-grid';
import { useStore } from '@/lib/store';
import { useEffect } from 'react';

export default function DashboardPage() {
  // This effect resets the selected tenant when the user navigates back to the dashboard.
  useEffect(() => {
    useStore.getState().setSelectedTenantId(null);
  }, []);

  return (
    <>
      <TenantSelectionGrid />
    </>
  );
}
