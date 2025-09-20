
'use client';

import { useStore } from '@/lib/store';
import type { Product, ProductType, Tenant } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';
import { Separator } from './ui/separator';

function ProductCard({ product, iconSrc }: { product: Product, iconSrc?: string }) {
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
        <CardContent className="relative flex-grow p-4 flex flex-col justify-center items-center text-center gap-2">
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
            {iconSrc && <Image src={iconSrc} alt={product.name} width={48} height={48} />}
            <p className="text-lg font-semibold">{product.name}</p>
            <p className="text-xl font-bold mt-1">Rs {product.selling_price.toFixed(2)}</p>
        </CardContent>
    </Card>
  );
}

function CategoryCard({ category, onSelect }: { category: ProductType, onSelect: () => void }) {
  const getIconForCategory = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('non-alcoholics')) {
      return '/images/NAD.svg';
    }
    if (name.includes('ticketing')) {
      return '/images/ticket.svg';
    }
    switch (name) {
      case 'beer':
        return '/images/beer.svg';
      case 'wine':
        return '/images/wine-glass.svg';
      case 'spirit':
        return '/images/cocktail.svg';
      default:
        return '/images/foodstuff.svg';
    }
  };

  const iconSrc = getIconForCategory(category.name);
  
  return (
     <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onSelect}
    >
        <CardContent className="relative flex-grow p-4 flex flex-col justify-center items-center text-center gap-4">
            <Image 
              src={iconSrc}
              alt={category.name}
              width={48} 
              height={48} 
            />
            <p className="text-lg font-semibold">{category.name}</p>
        </CardContent>
    </Card>
  )
}

const getIconForProduct = (productName: string): string | undefined => {
  const name = productName.toLowerCase();
  if (name.includes('early tickets')) {
    return '/images/ticket.svg';
  }
  if (name.includes('concert tickets')) {
    return '/images/ticket_001.svg';
  }
  return undefined;
};


export default function UnifiedProductView() {
  const { products, productTypes, tenants, fetchProductTypes, fetchTenants, activeShift } = useStore();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  useEffect(() => {
    if (activeShift) {
        fetchProductTypes(activeShift.role);
    }
    fetchTenants();
  }, [fetchProductTypes, fetchTenants, activeShift]);

  const selectedCategory = useMemo(() => {
    if (!selectedTypeId) return null;
    return productTypes.find(pt => pt.id === selectedTypeId);
  }, [selectedTypeId, productTypes]);

  const productsInCategory = useMemo(() => {
    if (!selectedTypeId) return [];
    return products.filter(p => p.product_type_id === selectedTypeId);
  }, [selectedTypeId, products]);

  const groupedProducts = useMemo(() => {
    return productsInCategory.reduce((acc, product) => {
      const tenantId = product.tenant_id;
      if (!acc[tenantId]) {
        acc[tenantId] = [];
      }
      acc[tenantId].push(product);
      return acc;
    }, {} as Record<number, Product[]>);
  }, [productsInCategory]);

  const tenantOrder = useMemo(() => {
    return Object.keys(groupedProducts)
      .map(Number)
      .sort((a, b) => {
        const tenantA = tenants.find(t => t.tenant_id === a);
        const tenantB = tenants.find(t => t.tenant_id === b);
        return tenantA?.name.localeCompare(tenantB?.name || '') || 0;
      });
  }, [groupedProducts, tenants]);


  if (selectedTypeId) {
     return (
        <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Products in {selectedCategory?.name}</CardTitle>
                    <CardDescription>Select a product to add it to the order.</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedTypeId(null)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Categories
                </Button>
                </CardHeader>
            </Card>
            {tenantOrder.length > 0 ? tenantOrder.map(tenantId => {
              const tenant = tenants.find(t => t.tenant_id === tenantId);
              if (!tenant) return null;

              return (
                <div key={tenantId} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Separator className="flex-1" />
                    <h2 className="text-xl font-bold tracking-tight text-primary">{tenant.name}</h2>
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {groupedProducts[tenantId].map(product => (
                          <ProductCard 
                            key={product.id} 
                            product={product} 
                            iconSrc={getIconForProduct(product.name)}
                          />
                      ))}
                  </div>
                </div>
              )
            }) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  No products found in this category.
                </CardContent>
              </Card>
            )}
        </div>
     )
  }

  return (
    <div className="space-y-4">
       <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>Select a category to view products.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {productTypes.map(pt => (
          <CategoryCard key={pt.id} category={pt} onSelect={() => setSelectedTypeId(pt.id)} />
        ))}
      </div>
    </div>
  );
}
