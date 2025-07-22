
'use client';

import type { Order, Tenant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, DollarSign, Hash, Printer } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import Link from 'next/link';
import React from 'react';

interface TenantReportProps {
  tenant: Tenant;
  orders: Order[];
}

export default function TenantReport({ tenant, orders }: TenantReportProps) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalVat = orders.reduce((sum, order) => sum + order.vat, 0);
  const tenantShare = totalRevenue * 0.7;
  const organizerShare = totalRevenue * 0.3;

  const handlePrint = () => {
    window.print();
  };
  
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div id="tenant-report-content" className="space-y-8 p-4 bg-background">
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
            <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 no-print-break">
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

        <Card className="no-print-break">
            <CardHeader>
            <CardTitle>All Orders</CardTitle>
            <CardDescription>
                A log of all individual transactions for this tenant, with a detailed breakdown of items.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Order Details / Product</TableHead>
                          <TableHead className="text-center">Quantity / Status</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {sortedOrders.length > 0 ? sortedOrders.map((order) => (
                          <React.Fragment key={order.id}>
                            <TableRow className="bg-muted/50 hover:bg-muted/80 no-print-break">
                                <TableCell className="font-medium">
                                    <div className="font-mono text-xs">ID: {order.id.split('-')[1]}</div>
                                    <div className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleString()}</div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Badge variant={order.synced ? 'default' : 'secondary'} className={order.synced ? 'bg-green-500/20 text-green-700' : ''}>
                                        {order.synced ? 'Synced' : 'Local'}
                                    </Badge>
                                </TableCell>
                                <TableCell></TableCell> 
                                <TableCell className="text-right font-bold">
                                    <div>Rs {order.total.toFixed(2)}</div>
                                    <div className="text-xs font-normal text-muted-foreground">(VAT: Rs {order.vat.toFixed(2)})</div>
                                </TableCell>
                            </TableRow>
                             {order.items.map((item) => (
                                <TableRow key={item.id} className="text-sm">
                                    <TableCell className="pl-8">{item.name}</TableCell>
                                    <TableCell className="text-center">{item.quantity}</TableCell>
                                    <TableCell className="text-right">Rs {item.price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right">Rs {(item.price * item.quantity).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                          </React.Fragment>
                      )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                            No orders found for this tenant.
                            </TableCell>
                        </TableRow>
                      )}
                  </TableBody>
                   <TableFooter>
                    <TableRow className="bg-muted/80 hover:bg-muted/80 font-bold no-print-break">
                        <TableCell colSpan={3} className="text-right">Grand Total</TableCell>
                        <TableCell className="text-right font-mono">
                           <div>Rs {totalRevenue.toFixed(2)}</div>
                           <div className="text-xs font-normal text-muted-foreground">(Total VAT: Rs {totalVat.toFixed(2)})</div>
                        </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
            </CardContent>
        </Card>
      </div>
  );
}
