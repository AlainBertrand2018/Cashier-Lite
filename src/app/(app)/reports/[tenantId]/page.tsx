
'use client';

import { useStore } from '@/lib/store';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import TenantReport from '@/components/tenant-report';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function TenantReportPage() {
  const params = useParams();
  const tenantId = parseInt(params.tenantId as string, 10);
  
  const { tenants, completedOrders, fetchTenants } = useStore();
  const [isClient, setIsClient] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    fetchTenants();
  }, [fetchTenants]);

  const tenant = tenants.find(t => t.tenant_id === tenantId);
  const tenantOrders = completedOrders.filter(o => o.tenantId === tenantId);

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (input && tenant) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let width = pdfWidth;
        let height = width / ratio;
        
        if (height > pdfHeight) {
            height = pdfHeight;
            width = height * ratio;
        }

        pdf.addImage(imgData, 'PNG', 0, 0, width, height);
        pdf.save(`Tenant-Report-${tenant.name.replace(/\s/g, '_')}-${new Date().toISOString().slice(0, 10)}.pdf`);
      });
    }
  };

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading report...</p>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p>Tenant not found.</p>
        <Button asChild variant="outline">
          <Link href="/reports">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Reports
          </Link>
        </Button>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold tracking-tight">Tenant Sales Report</h1>
            <p className="text-muted-foreground">Detailed report for {tenant.name}</p>
          </div>
        </div>
        <Button onClick={handleDownloadPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <div ref={reportRef}>
        <TenantReport tenant={tenant} orders={tenantOrders} />
      </div>
    </div>
  );
}
