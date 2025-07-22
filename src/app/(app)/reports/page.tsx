
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RevenueReport from '@/components/revenue-report';
import { useToast } from '@/hooks/use-toast';
import { useStore } from '@/lib/store';
import { Eraser, FileDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { clearCompletedOrders, completedOrders } = useStore();
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleResetShift = () => {
    clearCompletedOrders();
    setIsResetDialogOpen(false);
    toast({
      title: 'Shift Reset',
      description: 'All completed orders for this session have been cleared.',
    });
  };

  const handleDownloadPdf = () => {
    const input = reportRef.current;
    if (input) {
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
      pdf.text('END OF SHIFT REPORT', margin, currentY);
      currentY += 8;

      // Body Metadata
      pdf.setFontSize(10).setFont('helvetica', 'normal');
      pdf.text(`Date & Time: ${new Date().toLocaleString()}`, margin, currentY);
      currentY += 10;
      
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        
        let imgWidth = pdfWidth - margin * 2;
        let imgHeight = imgWidth / ratio;

        const remainingPageHeight = pdfHeight - currentY - (margin + 15);
        if (imgHeight > remainingPageHeight) {
          imgHeight = remainingPageHeight;
          imgWidth = imgHeight * ratio;
        }

        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);

        // Footer
        const footerY = pdf.internal.pageSize.getHeight() - margin;
        pdf.setFontSize(8).setFont('helvetica', 'italic');
        pdf.text('This is an official sales digitally generated report. No signature is required.', pdfWidth / 2, footerY - 5, { align: 'center' });
        pdf.setFontSize(8).setFont('helvetica', 'bold');
        pdf.text('© 2025 SIPAI ONLINE SYSTEMS • All rights reserved.', pdfWidth / 2, footerY, { align: 'center' });

        pdf.save(`Shift-Report-${new Date().toISOString().slice(0, 10)}.pdf`);
      });
    }
  };

  if (!isClient) {
    return null; // Or a loading skeleton
  }

  return (
    <>
       <div className="space-y-4">
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">End of Shift Report</h1>
                <p className="text-muted-foreground">Review sales data and manage the current shift.</p>
            </div>
            <div className="flex gap-2">
                 <Button 
                    variant="destructive" 
                    onClick={() => setIsResetDialogOpen(true)}
                    disabled={completedOrders.length === 0}
                >
                    <Eraser className="mr-2 h-4 w-4" />
                    Reset Shift
                </Button>
                 <Button onClick={handleDownloadPdf}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Download PDF
                </Button>
            </div>
        </div>
        <div ref={reportRef}>
            <RevenueReport />
        </div>
      </div>


      <AlertDialog
        open={isResetDialogOpen}
        onOpenChange={setIsResetDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently clear all{' '}
              {completedOrders.length} completed order(s) from this session.
              Synced orders will remain in the database, but all local records
              for this shift will be erased.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetShift}>
              Yes, reset shift
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
