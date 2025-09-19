
'use client';

import { useStore } from '@/lib/store';
import { Product, Tenant } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from './ui/input';
import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';


function ProductCard({ product }: { product: Product }) {
  const { addProductToOrder } = useStore();
  const needsReorder = product.initial_stock > 0 && product.stock <= product.initial_stock * 0.1;
  const isOutOfStock = product.stock <= 0;

  return (
    <Card 
      className={cn(
        "flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer",
        isOutOfStock && "opacity-50 cursor-not-allowed hover:shadow-sm"
        )}
      onClick={() => !isOutOfStock && addProductToOrder(product)}
    >
        <CardContent className="relative flex-grow p-4 flex flex-col justify-center items-center text-center">
            <Badge 
            variant={needsReorder ? 'destructive' : 'secondary'} 
            className={cn(
                'absolute top-2 right-2',
                !needsReorder && !isOutOfStock && 'bg-green-500/20 text-green-700',
                isOutOfStock && 'bg-gray-500/20 text-gray-700'
            )}
            >
            {isOutOfStock ? 'Out of Stock' : `${product.stock} left`}
            </Badge>
            <p className="text-lg font-semibold mt-4">{product.name}</p>
            <p className="text-xl font-bold mt-1">Rs {product.selling_price.toFixed(2)}</p>
        </CardContent>
    </Card>
  );
}

export default function UnifiedProductView() {
  const { products, tenants } = useStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchTerm) {
      return products;
    }
    return products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, searchTerm]);

  const productsByTenant = useMemo(() => {
    return filteredProducts.reduce((acc, product) => {
      const tenantId = product.tenant_id;
      if (!acc[tenantId]) {
        acc[tenantId] = [];
      }
      acc[tenantId].push(product);
      return acc;
    }, {} as Record<number, Product[]>);
  }, [filteredProducts]);
  
  const sortedTenants = useMemo(() => {
    return [...tenants].sort((a, b) => a.name.localeCompare(b.name));
  }, [tenants]);

  const openAccordionItems = useMemo(() => {
    if (!searchTerm) return [];
    // If there's a search term, return the list of all tenant IDs that have matching products
    return Object.keys(productsByTenant).map(tenantId => `tenant-${tenantId}`);
  }, [searchTerm, productsByTenant]);

  return (
    <div className="space-y-4">
       <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Select products from any tenant to begin an order.</CardDescription>
        </CardHeader>
        <CardContent>
           <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Accordion 
        type="multiple" 
        className="w-full space-y-2"
        key={openAccordionItems.join('-')} // Force re-render when search term changes
        defaultValue={openAccordionItems}
      >
        {sortedTenants.map(tenant => {
          const tenantProducts = productsByTenant[tenant.tenant_id];
          if (!tenantProducts || tenantProducts.length === 0) {
            return null; // Don't render tenants with no matching products during a search
          }
          return (
             <Card key={tenant.tenant_id} className="overflow-hidden">
                <AccordionItem value={`tenant-${tenant.tenant_id}`} className="border-b-0">
                    <AccordionTrigger className="p-4 hover:no-underline bg-muted/50">
                       <div className="flex items-center gap-4">
                         <div className="text-3xl font-extrabold tracking-tighter">{tenant.tenant_id}</div>
                          <div>
                            <h3 className="text-lg font-semibold text-left">{tenant.name}</h3>
                            <p className="text-sm text-muted-foreground text-left">{tenant.mobile}</p>
                          </div>
                       </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {tenantProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Card>
          )
        })}
      </Accordion>
    </div>
  );
}
