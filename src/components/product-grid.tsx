'use client';

import Image from 'next/image';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

function ProductCard({ product }: { product: Product }) {
  const addProductToOrder = useStore((state) => state.addProductToOrder);

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product['data-ai-hint']}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-4">
        <CardTitle className="text-base font-medium">{product.name}</CardTitle>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
        <Button size="sm" onClick={() => addProductToOrder(product)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function ProductGrid() {
  const { products, selectedTenantId } = useStore();

  const filteredProducts = products.filter(
    (product) => product.tenantId === selectedTenantId
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
