
'use client';

import { useStore } from '@/lib/store';
import { Product, ProductType } from '@/lib/types';
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
import { ArrowLeft, Box } from 'lucide-react';
import { Button } from './ui/button';

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

function CategoryCard({ category, onSelect }: { category: ProductType, onSelect: () => void }) {
  return (
     <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={onSelect}
    >
        <CardContent className="relative flex-grow p-4 flex flex-col justify-center items-center text-center gap-4">
            <Box className="w-12 h-12 text-muted-foreground" />
            <p className="text-lg font-semibold">{category.name}</p>
        </CardContent>
    </Card>
  )
}

export default function UnifiedProductView() {
  const { products, productTypes, fetchProductTypes } = useStore();
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  useEffect(() => {
    fetchProductTypes();
  }, [fetchProductTypes]);

  const selectedCategory = useMemo(() => {
    if (!selectedTypeId) return null;
    return productTypes.find(pt => pt.id === selectedTypeId);
  }, [selectedTypeId, productTypes]);

  const productsInCategory = useMemo(() => {
    if (!selectedTypeId) return [];
    return products.filter(p => p.product_type_id === selectedTypeId);
  }, [selectedTypeId, products]);


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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productsInCategory.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
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
