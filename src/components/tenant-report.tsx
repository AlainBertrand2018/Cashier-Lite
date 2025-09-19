
'use client';

import type { Order, Product, Tenant } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Hash, Package } from 'lucide-react';
import React from 'react';
import { Badge } from './ui/badge';

interface TenantReportProps {
  tenant: Tenant;
  orders: Order[];
  products: Product[];
}

export default function TenantReport({ tenant, orders, products }: TenantReportProps) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const tenantShare = totalRevenue * 0.7;
  const organizerShare = totalRevenue * 0.3;
  
  const sortedOrders = [...orders].sort((a, b) => b.createdAt - a.createdAt);

  const inventoryData = products.map(product => {
    const unitsSold = orders.flatMap(o => o.items)
                            .filter(item => item.id === product.id)
                            .reduce((sum, item) => sum + item.quantity, 0);
    const unitsLeft = product.stock - unitsSold;
    const reorderThreshold = product.stock * 0.25;
    const needsReorder = unitsLeft <= reorderThreshold;

    return {
      ...product,
      unitsSold,
      unitsLeft,
      needsReorder,
    };
  }).sort((a,b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8">
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
        
        <div className="grid gap-8 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Inventory Status</CardTitle>
                    <CardDescription>
                        Current stock levels based on sales for this shift.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-center">Sold</TableHead>
                                <TableHead className="text-center">Left</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {inventoryData.length > 0 ? inventoryData.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell className="text-center">{product.unitsSold}</TableCell>
                                    <TableCell className="text-center">{product.unitsLeft}</TableCell>
                                    <TableCell className="text-center">
                                        {product.needsReorder ? (
                                            <Badge variant="destructive">Re-order</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-green-500/20 text-green-700">OK</Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No products found for this tenant.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                     </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>All Orders</CardTitle>
                <CardDescription>
                    A log of all individual transactions for this tenant.
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
                                <TableRow className="bg-muted/50 hover:bg-muted/80">
                                    <TableCell className="font-medium">
                                        <div className="font-mono text-xs">ID: {order.id.split('-')[1]}</div>
                                        <div className="text-muted-foreground text-xs">{new Date(order.createdAt).toLocaleString()}</div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant={order.synced ? 'default' : 'secondary'} className={order.synced ? 'bg-green-500/20 text-green-700' : ''}>
                                            {order.synced ? 'Synced' : 'Local'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell></TableCell> {/* Empty cell for alignment */}
                                    <TableCell className="text-right font-bold">Rs {order.total.toFixed(2)}</TableCell>
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
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
  );
}
