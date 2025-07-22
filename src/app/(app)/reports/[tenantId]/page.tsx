
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
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;

      // Header
      pdf.setFontSize(14).setFont('helvetica', 'bold');
      pdf.text('FESTIVAL INTERNATIONAL DES SAVEURS LTD', pdfWidth / 2, margin, { align: 'center' });
      pdf.setFontSize(8).setFont('helvetica', 'normal');
      pdf.text('BRN : C34567265 • VAT 3242567', pdfWidth / 2, margin + 5, { align: 'center' });
      pdf.text('23, Dock 4, The Docks, Port Louis', pdfWidth / 2, margin + 9, { align: 'center' });

      let currentY = margin + 20;

      // Body Title
      pdf.setFontSize(12).setFont('helvetica', 'bold');
      pdf.text(`SALES REPORT For ${tenant.name}`, margin, currentY);
      currentY += 8;

      // Body Metadata
      pdf.setFontSize(10).setFont('helvetica', 'normal');
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, margin, currentY);
      pdf.text(`Tenant ID: ${tenant.tenant_id}`, pdfWidth - margin, currentY, { align: 'right'});
      currentY += 5;
      pdf.text(`Stand No.: ${tenant.tenant_id}`, pdfWidth - margin, currentY, { align: 'right' });
      currentY += 10;

      // Report Content
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth - margin * 2;
        let imgHeight = imgWidth / ratio;
        
        const remainingPageHeight = pdfHeight - currentY - (margin + 15); // page height - current pos - footer height
        if (imgHeight > remainingPageHeight) {
          imgHeight = remainingPageHeight;
          imgWidth = imgHeight * ratio;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

        // Footer
        const footerY = pdfHeight - margin;
        pdf.setFontSize(8).setFont('helvetica', 'italic');
        pdf.text('This is an official sales digitally generated report. No signature is required.', pdfWidth / 2, footerY - 5, { align: 'center' });
        pdf.setFontSize(8).setFont('helvetica', 'bold');
        pdf.text('© 2025 SIPAI ONLINE SYSTEMS • All rights reserved.', pdfWidth / 2, footerY, { align: 'center' });

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
