
'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Hash, CheckCircle, Clock, Printer, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import type { Product } from '@/lib/types';

interface TenantReport {
  id: string;
  name: string;
  orderCount: number;
  totalRevenue: number;
  tenantShare: number;
  organizerShare: number;
}

export default function RevenueReport() {
  const { completedOrders, products } = useStore();

  const grossRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = completedOrders.length;
  const syncedOrders = completedOrders.filter(order => order.synced).length;
  const pendingSyncOrders = totalOrders - syncedOrders;

  const sortedOrders = [...completedOrders].sort((a, b) => b.createdAt - a.createdAt);

  const tenants = Array.from(
    new Map(products.map((p: Product) => [p.tenantId, { id: p.tenantId, name: p.tenantName }])).values()
  );

  const tenantReports = tenants.map(tenant => {
    const ordersForTenant = completedOrders.filter(o => o.tenantId === tenant.id);
    const revenueForTenant = ordersForTenant.reduce((sum, o) => sum + o.total, 0);
    return {
      id: tenant.id,
      name: tenant.name,
      orderCount: ordersForTenant.length,
      totalRevenue: revenueForTenant,
      tenantShare: revenueForTenant * 0.7,
      organizerShare: revenueForTenant * 0.3,
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue);

  const handlePrint = () => {
    const printContents = document.getElementById('revenue-sharing-content')?.innerHTML;
    const originalContents = document.body.innerHTML;
    if (printContents) {
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); 
    }
  };


  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {grossRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total revenue from all orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Total number of completed orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Synced Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{syncedOrders}</div>
            <p className="text-xs text-muted-foreground">Orders successfully saved to cloud</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSyncOrders}</div>
            <p className="text-xs text-muted-foreground">Orders stored locally</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Tenant</CardTitle>
            <CardDescription>A breakdown of sales for each tenant.</CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tenant</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantReports.map(report => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-xs text-muted-foreground">ID: {report.id}</div>
                      </TableCell>
                      <TableCell className="text-center">{report.orderCount}</TableCell>
                      <TableCell className="text-right font-mono">Rs {report.totalRevenue.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                   {tenantReports.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">
                            No sales data available.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Revenue Sharing</CardTitle>
              <CardDescription>70% for tenant, 30% for organizers.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
          </CardHeader>
          <CardContent>
            <div id="revenue-sharing-content">
              <style>
              {`
                @media print {
                  body * {
                    visibility: hidden;
                  }
                  #revenue-sharing-content, #revenue-sharing-content * {
                    visibility: visible;
                  }
                  #revenue-sharing-content {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                  }
                  .print-instance {
                    page-break-after: always;
                  }
                   .print-instance:last-child {
                    page-break-after: avoid;
                  }
                }
              `}
              </style>
              <div className="print-instance">
                <div className="text-center mb-4 hidden print:block">
                  <h2 className="text-xl font-bold">Revenue Sharing: Copy 1</h2>
                  <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleString()}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Tenant (70%)</TableHead>
                      <TableHead className="text-right">Organizer (30%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="text-right font-mono">Rs {report.tenantShare.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">Rs {report.organizerShare.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {tenantReports.length === 0 && (
                      <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                              No revenue data available.
                          </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="print-instance">
                 <div className="text-center mb-4 hidden print:block">
                  <h2 className="text-xl font-bold">Revenue Sharing: Copy 2</h2>
                  <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleString()}</p>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead className="text-right">Tenant (70%)</TableHead>
                      <TableHead className="text-right">Organizer (30%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantReports.map(report => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell className="text-right font-mono">Rs {report.tenantShare.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">Rs {report.organizerShare.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>A log of all individual transactions for the shift.</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id.split('-')[1]}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleTimeString()}</TableCell>
                    <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                    <TableCell>
                      <Badge variant={order.synced ? "default" : "secondary"} className={order.synced ? "bg-green-500/20 text-green-700" : ""}>
                        {order.synced ? "Synced" : "Local"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">Rs {order.total.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                {sortedOrders.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No orders placed yet.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
