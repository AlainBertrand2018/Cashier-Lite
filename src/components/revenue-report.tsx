
'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Hash, Clock, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';


interface TenantReport {
  id: number;
  name: string;
  orderCount: number;
  totalRevenue: number;
  revenue_share_percentage: number;
}

export default function RevenueReport() {
  const { completedOrders, tenants, fetchTenants } = useStore();
  const router = useRouter();

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);


  const pendingSyncOrders = completedOrders.filter(order => !order.synced).length;
  const sortedOrders = [...completedOrders].sort((a, b) => b.createdAt - a.createdAt);

  const tenantReports = tenants.map(tenant => {
    const ordersForTenant = completedOrders.filter(o => o.tenantId === tenant.tenant_id);
    const revenueForTenant = ordersForTenant.reduce((sum, o) => sum + o.total, 0);
    return {
      id: tenant.tenant_id,
      name: tenant.name,
      orderCount: ordersForTenant.length,
      totalRevenue: revenueForTenant,
      revenue_share_percentage: tenant.revenue_share_percentage,
    };
  });
  
  const grossRevenue = tenantReports.reduce((sum, report) => sum + report.totalRevenue, 0);
  const totalOrders = completedOrders.length;
  
  const organizerTotalRevenue = tenantReports.reduce((sum, report) => {
    const tenantShare = report.totalRevenue * (report.revenue_share_percentage / 100);
    const organizerShare = report.totalRevenue - tenantShare;
    return sum + organizerShare;
  }, 0);


  const topTenants = [...tenantReports].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 5);

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
            <CardTitle className="text-sm font-medium">Organizer's Revenue</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {organizerTotalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Share of gross revenue</p>
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
            <CardTitle>Top Performing Tenants</CardTitle>
            <CardDescription>The 5 tenants with the highest sales revenue for the shift.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTenants.filter(t => t.orderCount > 0).map(tenant => (
                  <TableRow key={tenant.id} onClick={() => router.push(`/reports/${tenant.id}`)} className="cursor-pointer">
                    <TableCell>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-xs text-muted-foreground">Orders: {tenant.orderCount}</div>
                    </TableCell>
                    <TableCell className="text-right font-mono">Rs {tenant.totalRevenue.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
                 {topTenants.filter(t => t.orderCount > 0).length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                            No sales data available.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/reports/all-tenants">View All Tenants</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>A log of the most recent individual transactions for the shift.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
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
    </div>
  );
}
