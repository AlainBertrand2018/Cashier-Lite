
'use client';

import type { Order, Tenant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronDown, DollarSign, Hash, Printer } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import Link from 'next/link';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface TenantReportProps {
  tenant: Tenant;
  orders: Order[];
}

export default function TenantReport({ tenant, orders }: TenantReportProps) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const tenantShare = totalRevenue * 0.7;
  const organizerShare = totalRevenue * 0.3;

  const handlePrint = () => {
    window.print();
  };
  
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 print:hidden">
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
        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Report
        </Button>
      </div>

      <div id="tenant-report-content" className="space-y-8">
         <style>
              {`
                @media print {
                  body {
                    background-color: white;
                  }
                  .print\\:hidden {
                    display: none;
                  }
                  .no-print-break {
                     page-break-inside: avoid;
                  }
                }
              `}
        </style>
        <div className="print:block hidden text-center mb-8">
            <h1 className="text-2xl font-bold">{tenant.name} - Sales Report</h1>
            <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">Rs {totalRevenue.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                    <Hash className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{orders.length}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Tenant's Share (70%)</CardTitle>
                    <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-primary">Rs {tenantShare.toFixed(2)}</div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Organizer's Share (30%)</CardTitle>
                    <DollarSign className="h-4 w-4 text-secondary-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-secondary-foreground">Rs {organizerShare.toFixed(2)}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
                A log of all individual transactions for this tenant. Click on an order to see a detailed breakdown of items.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Order Details</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-right">Order Total</TableHead>
                          <TableHead className="w-10 print:hidden"></TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      <Accordion type="multiple" asChild>
                          <>
                              {sortedOrders.length > 0 ? sortedOrders.map((order) => (
                                <AccordionItem value={order.id} key={order.id} asChild className="no-print-break">
                                  <>
                                    <AccordionTrigger asChild>
                                        <TableRow className="hover:bg-accent cursor-pointer text-sm">
                                            <TableCell className="font-medium">
                                                <div className="font-mono text-xs">ID: {order.id.split('-')[1]}</div>
                                                <div className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant={order.synced ? 'default' : 'secondary'} className={order.synced ? 'bg-green-500/20 text-green-700' : ''}>
                                                    {order.synced ? 'Synced' : 'Local'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">Rs {order.total.toFixed(2)}</TableCell>
                                            <TableCell className="print:hidden">
                                                <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                            </TableCell>
                                        </TableRow>
                                    </AccordionTrigger>
                                    <AccordionContent asChild>
                                        <TableRow>
                                            <TableCell colSpan={4} className="p-2 bg-muted/50">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead className="h-8">Product Name</TableHead>
                                                            <TableHead className="h-8 text-center">Quantity</TableHead>
                                                            <TableHead className="h-8 text-right">Unit Price</TableHead>
                                                            <TableHead className="h-8 text-right">Line Total</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {order.items.map((item) => (
                                                            <TableRow key={item.id}>
                                                                <TableCell>{item.name}</TableCell>
                                                                <TableCell className="text-center">{item.quantity}</TableCell>
                                                                <TableCell className="text-right">Rs {item.price.toFixed(2)}</TableCell>
                                                                <TableCell className="text-right">Rs {(item.price * item.quantity).toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </TableCell>
                                        </TableRow>
                                    </AccordionContent>
                                  </>
                                </AccordionItem>
                              )) : (
                              <TableRow>
                                  <TableCell colSpan={4} className="h-24 text-center">
                                  No orders found for this tenant.
                                  </TableCell>
                              </TableRow>
                              )}
                          </>
                      </Accordion>
                  </TableBody>
                </Table>
            </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
