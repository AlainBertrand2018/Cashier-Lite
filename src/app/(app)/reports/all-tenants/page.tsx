
'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, FileDown } from 'lucide-react';
import { AllTenantsReport } from '@/components/all-tenants-report';
import { useRef } from 'react';

export default function AllTenantsReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);
  
  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (input) {
      const { jsPDF } = require('jspdf');
      const html2canvas = require('html2canvas');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
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
      pdf.text('ALL TENANTS PERFORMANCE REPORT', margin, currentY);
      currentY += 8;

      // Body Metadata
      pdf.setFontSize(10).setFont('helvetica', 'normal');
      pdf.text(`Date & Time: ${new Date().toLocaleString()}`, margin, currentY);
      currentY += 10;
      

      html2canvas(input, { scale: 2 }).then((canvas: any) => {
        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth - margin * 2;
        let imgHeight = imgWidth / ratio;

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

        // Footer
        const footerY = pdf.internal.pageSize.getHeight() - margin;
        pdf.setFontSize(8).setFont('helvetica', 'italic');
        pdf.text('This is an official sales digitally generated report. No signature is required.', pdfWidth / 2, footerY - 5, { align: 'center' });
        pdf.setFontSize(8).setFont('helvetica', 'bold');
        pdf.text('© 2025 SIPAI ONLINE SYSTEMS • All rights reserved.', pdfWidth / 2, footerY, { align: 'center' });

        pdf.save(`All-Tenants-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      });
    }
  };

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
        <Button onClick={handleDownloadPdf}>
          <FileDown className="mr-2 h-4 w-4" />
          Download PDF
        </Button>
      </div>
      <div ref={reportRef}>
        <AllTenantsReport />
      </div>
    </div>
  );
}
