
'use client';

import { useStore } from '@/lib/store';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AllTenantsReport() {
  const { tenants, completedOrders, fetchTenants } = useStore();
  const router = useRouter();

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const tenantReports = tenants
    .map((tenant) => {
      const ordersForTenant = completedOrders.filter(
        (o) => o.tenantId === tenant.tenant_id
      );
      const revenueForTenant = ordersForTenant.reduce(
        (sum, o) => sum + o.total,
        0
      );
      return {
        id: tenant.tenant_id,
        name: tenant.name,
        orderCount: ordersForTenant.length,
        totalRevenue: revenueForTenant,
        tenantShare: revenueForTenant * 0.7,
        organizerShare: revenueForTenant * 0.3,
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue);

  const grandTotalRevenue = tenantReports.reduce((sum, r) => sum + r.totalRevenue, 0);
  const grandTotalVat = completedOrders.reduce((sum, o) => sum + o.vat, 0);
  const grandTotalTenantShare = tenantReports.reduce((sum, r) => sum + r.tenantShare, 0);
  const grandTotalOrganizerShare = tenantReports.reduce((sum, r) => sum + r.organizerShare, 0);


  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant ID</TableHead>
              <TableHead>Tenant Name</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Gross Revenue</TableHead>
              <TableHead className="text-right">Tenant Share (70%)</TableHead>
              <TableHead className="text-right">Organizer Share (30%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenantReports.map((report) => (
              <TableRow key={report.id} onClick={() => router.push(`/reports/${report.id}`)} className="cursor-pointer">
                <TableCell>{report.id}</TableCell>
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell className="text-right">{report.orderCount}</TableCell>
                <TableCell className="text-right font-mono">
                  Rs {report.totalRevenue.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  Rs {report.tenantShare.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono">
                  Rs {report.organizerShare.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
            {tenantReports.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        No sales data available.
                    </TableCell>
                </TableRow>
            )}
          </TableBody>
           <TableFooter>
            <TableRow className="bg-muted/80 font-bold hover:bg-muted/80">
              <TableCell colSpan={3} className="text-right font-bold">Grand Totals</TableCell>
              <TableCell className="text-right font-mono">
                <div>Rs {grandTotalRevenue.toFixed(2)}</div>
                <div className="text-xs font-normal text-muted-foreground">(VAT: Rs {grandTotalVat.toFixed(2)})</div>
              </TableCell>
              <TableCell className="text-right font-mono">Rs {grandTotalTenantShare.toFixed(2)}</TableCell>
              <TableCell className="text-right font-mono">Rs {grandTotalOrganizerShare.toFixed(2)}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}
