
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AllTenantsReport } from '@/components/all-tenants-report';

export default function AllTenantsReportPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
            <Link href="/reports">
              <ArrowLeft />
              <span className="sr-only">Back to Reports</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Tenants Performance</h1>
            <p className="text-muted-foreground">Full performance breakdown for all tenants.</p>
          </div>
        </div>
      </div>
      <AllTenantsReport />
    </div>
  );
}
