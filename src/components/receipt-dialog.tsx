'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Printer, RefreshCw } from 'lucide-react';
import type { Order } from '@/lib/types';
import { Logo } from './icons';

interface ReceiptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: Order | null;
}

export default function ReceiptDialog({ isOpen, onOpenChange, order }: ReceiptDialogProps) {
  const handlePrint = () => {
    // This uses a CSS trick to hide everything but the receipt content when printing
    const printContents = document.getElementById('receipt-content')?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // Reload to re-attach React components
    }
  };

  if (!order) return null;
  const orderDate = new Date(order.createdAt);

  const ReceiptBody = ({ order }: { order: Order }) => (
    <>
      <div className="text-sm text-muted-foreground">
        <p>Order ID: {order.id}</p>
        <p>Date: {orderDate.toLocaleString()}</p>
      </div>
      <Separator />
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-baseline">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} x ${item.price.toFixed(2)}
              </p>
            </div>
            <p className="font-mono">${(item.quantity * item.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-xl">
        <p>Total</p>
        <p className="font-mono">${order.total.toFixed(2)}</p>
      </div>
      <Separator />
    </>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <div id="receipt-content">
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                #receipt-content, #receipt-content * {
                  visibility: visible;
                }
                #receipt-content {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
                .receipt-instance {
                  page-break-after: always;
                }
                .receipt-instance:last-child {
                  page-break-after: avoid;
                }
              }
            `}
          </style>

          {/* Customer Receipt */}
          <div className="receipt-instance">
            <DialogHeader className="items-center text-center">
              <Logo className="h-10 w-10 text-primary mb-2" />
              <DialogTitle className="text-2xl">FIDS Cashier Lite</DialogTitle>
              <p className="text-muted-foreground font-bold">CUSTOMER RECEIPT</p>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <ReceiptBody order={order} />
              <p className="text-center text-xs text-muted-foreground pt-4">
                Thank you for your patronage!
              </p>
            </div>
          </div>

          {/* Tenant Receipt */}
          <div className="receipt-instance">
            <DialogHeader className="items-center text-center">
              <Logo className="h-10 w-10 text-primary mb-2" />
              <DialogTitle className="text-2xl">FIDS Cashier Lite</DialogTitle>
              <p className="text-muted-foreground font-bold">TENANT RECEIPT</p>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <ReceiptBody order={order} />
              <p className="text-center text-xs text-muted-foreground pt-4">
                Fully Paid at {orderDate.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2 print:hidden">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Re-Order
          </Button>
          <Button type="button" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
