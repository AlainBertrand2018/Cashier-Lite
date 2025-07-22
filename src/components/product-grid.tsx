'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle } from 'lucide-react';
import AddProductDialog from './add-product-dialog';

function ProductCard({ product }: { product: Product }) {
  const addProductToOrder = useStore((state) => state.addProductToOrder);

  return (
    <Card 
      className="flex flex-col overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => addProductToOrder(product)}
    >
      <CardContent className="flex-grow p-4 flex flex-col justify-center items-center text-center">
        <p className="text-lg font-semibold">{product.name}</p>
        <p className="text-xl font-bold mt-1">Rs {product.price.toFixed(2)}</p>
      </CardContent>
    </Card>
  );
}

export default function ProductGrid() {
  const { products, selectedTenantId } = useStore();
  const [isAddProductOpen, setAddProductOpen] = useState(false);

  if (!selectedTenantId) return null;

  const filteredProducts = products.filter(
    (product) => product.tenantId === selectedTenantId.toString()
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        <Card
          onClick={() => setAddProductOpen(true)}
          className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary"
        >
          <CardHeader className="flex flex-col items-center justify-center text-center p-4 h-32">
            <PlusCircle className="h-10 w-10 mb-2" />
            <CardTitle className="text-lg font-semibold">Add Product</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <AddProductDialog 
        isOpen={isAddProductOpen}
        onOpenChange={setAddProductOpen}
        tenantId={selectedTenantId}
      />
    </>
  );
}
