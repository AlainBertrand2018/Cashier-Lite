'use client';

import { useStore } from '@/lib/store';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';

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
