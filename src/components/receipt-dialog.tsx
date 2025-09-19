
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
import type { Event, MultiTenantOrder, Tenant, OrderItem } from '@/lib/types';
import Image from 'next/image';
import { useStore } from '@/lib/store';
import { useEffect, useMemo } from 'react';
import { format } from 'date-fns';

interface ReceiptDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  order: MultiTenantOrder | null;
}

export default function ReceiptDialog({ isOpen, onOpenChange, order }: ReceiptDialogProps) {
  const { getTenantById, fetchTenants, getActiveEvent, fetchEvents } = useStore();
   const tenants = useStore(state => state.tenants);

  useEffect(() => {
    if (order) {
        fetchTenants();
        fetchEvents();
    }
  }, [order, fetchTenants, fetchEvents]);

  const handlePrint = () => {
    const printContents = document.getElementById('receipt-content')?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); 
    }
  };
  
  const tenantMap = useMemo(() => new Map(tenants.map(t => [t.tenant_id, t])), [tenants]);

  if (!order) return null;
  const orderDate = new Date(order.createdAt);
  const activeEvent = getActiveEvent();
  
  const itemsByTenant = order.items.reduce((acc, item) => {
    const tenantId = item.tenant_id;
    if (!acc[tenantId]) {
      acc[tenantId] = [];
    }
    acc[tenantId].push(item);
    return acc;
  }, {} as Record<number, OrderItem[]>);

  const ReceiptBody = ({ order, event }: { order: MultiTenantOrder, event: Event | undefined }) => (
    <>
      <div className="text-sm text-muted-foreground">
        {event && (
            <>
                <div className="flex justify-between">
                    <span>Event:</span>
                    <span className="font-mono">{event.id} ({event.name})</span>
                </div>
                 <div className="flex justify-between">
                    <span>Event Date:</span>
                    <span>{format(new Date(event.start_date), 'dd/MM')} - {format(new Date(event.end_date), 'dd/MM/yyyy')}</span>
                </div>
            </>
        )}
        <div className="flex justify-between">
            <span>Transaction ID:</span>
            <span className="font-mono">{order.id.split('-')[1]}</span>
        </div>
        <div className="flex justify-between">
            <span>Date:</span>
            <span>{orderDate.toLocaleString()}</span>
        </div>
      </div>
      <Separator />
      <div className="space-y-2">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between items-baseline">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                {item.quantity} x Rs {item.price.toFixed(2)}
              </p>
            </div>
            <p className="font-mono">Rs {(item.quantity * item.price).toFixed(2)}</p>
          </div>
        ))}
      </div>
      <Separator />
      <div className="space-y-2 text-muted-foreground">
          <div className="flex justify-between">
              <p>Subtotal</p>
              <p className="font-mono">Rs {order.subtotal.toFixed(2)}</p>
          </div>
            <div className="flex justify-between">
                <p>VAT (15%)</p>
                <p className="font-mono">Rs {order.vat.toFixed(2)}</p>
            </div>
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-xl">
        <p>Total</p>
        <p className="font-mono">Rs {order.total.toFixed(2)}</p>
      </div>
      <Separator />
    </>
  );

  const TenantReceiptBody = ({ tenant, items, orderId }: { tenant: Tenant, items: OrderItem[], orderId: string }) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const vat = subtotal * 0.15;
    const total = subtotal + vat;

    return (
       <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
                <div className="flex justify-between">
                    <span>Order ID:</span>
                    <span className="font-mono">{orderId.split('-')[2]}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tenant ID:</span>
                    <span className="font-mono">{tenant.tenant_id} ({tenant.name})</span>
                </div>
                {tenant.brn && (
                    <div className="flex justify-between">
                        <span>BRN:</span>
                        <span className="font-mono">{tenant.brn}</span>
                    </div>
                )}
                {tenant.vat && (
                    <div className="flex justify-between">
                        <span>VAT Number:</span>
                        <span className="font-mono">{tenant.vat}</span>
                    </div>
                )}
            </div>
            <Separator />
            <div className="space-y-2">
                {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-baseline">
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                                {item.quantity} x Rs {item.price.toFixed(2)}
                            </p>
                        </div>
                        <p className="font-mono">Rs {(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <Separator />
            <div className="space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p className="font-mono">Rs {subtotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <p>VAT (15%)</p>
                    <p className="font-mono">Rs {vat.toFixed(2)}</p>
                </div>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
                <p>Total</p>
                <p className="font-mono">Rs {total.toFixed(2)}</p>
            </div>
            <Separator />
        </div>
    )
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <div className="flex-grow overflow-y-auto pr-6 -mr-6">
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

              <div className="receipt-instance">
                <DialogHeader className="items-center text-center">
                  <Image src="/images/logo_1024.webp" alt="FIDS Cashier Lite Logo" width={40} height={40} className="mb-2" />
                  <DialogTitle className="text-2xl">FIDS Cashier Lite</DialogTitle>
                  <p className="text-muted-foreground font-bold">CUSTOMER RECEIPT</p>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <ReceiptBody order={order} event={activeEvent} />
                  <p className="text-center text-xs text-muted-foreground pt-4">
                    Thank you for your patronage!
                  </p>
                </div>
              </div>

              {Object.entries(itemsByTenant).map(([tenantId, items]) => {
                 const tenant = tenantMap.get(parseInt(tenantId, 10));
                 const constituentOrder = order.constituentOrders.find(o => o.tenantId === parseInt(tenantId, 10));
                 if (!tenant || !constituentOrder) return null;

                 return (
                    <div className="receipt-instance" key={tenantId}>
                        <DialogHeader className="items-center text-center">
                        <Image src="/images/logo_1024.webp" alt="FIDS Cashier Lite Logo" width={40} height={40} className="mb-2" />
                        <DialogTitle className="text-2xl">FIDS Cashier Lite</DialogTitle>
                        <p className="text-muted-foreground font-bold">TENANT RECEIPT</p>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <TenantReceiptBody tenant={tenant} items={items} orderId={constituentOrder.id} />
                            <p className="text-center text-xs text-muted-foreground pt-4">
                                Fully Paid at {orderDate.toLocaleString()}
                            </p>
                        </div>
                    </div>
                 );
              })}
            </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2 print:hidden pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            New Order
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

    