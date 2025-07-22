
'use client';

import type { Order, Tenant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Hash, Printer } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import Link from 'next/link';

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
                A log of all individual transactions for this tenant during the shift.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <ScrollArea className="h-[400px]">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead># Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs">{order.id.split('-')[1]}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                        <TableCell>
                        <Badge variant={order.synced ? 'default' : 'secondary'} className={order.synced ? 'bg-green-500/20 text-green-700' : ''}>
                            {order.synced ? 'Synced' : 'Local'}
                        </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">Rs {order.total.toFixed(2)}</TableCell>
                    </TableRow>
                    ))}
                    {sortedOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                        No orders found for this tenant.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </ScrollArea>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
