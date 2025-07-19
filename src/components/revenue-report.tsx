'use client';

import { useStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DollarSign, Hash, CheckCircle, Clock } from 'lucide-react';
import { Badge } from './ui/badge';

export default function RevenueReport() {
  const completedOrders = useStore((state) => state.completedOrders);

  const grossRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = completedOrders.length;
  const syncedOrders = completedOrders.filter(order => order.synced).length;
  const pendingSyncOrders = totalOrders - syncedOrders;

  const sortedOrders = [...completedOrders].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${grossRevenue.toFixed(2)}</div>
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

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
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
                    <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
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
