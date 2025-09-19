

'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EditProductDialog from '@/components/edit-product-dialog';
import type { Product, ProductType } from '@/lib/types';
import AddProductDialog from '@/components/add-product-dialog';

export default function ManageProductsPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = parseInt(params.tenantId as string, 10);
  const { products, productTypes, deleteProduct, getTenantById, fetchTenants, fetchProducts, fetchProductTypes, setSelectedTenantId } = useStore();
  
  const [tenantName, setTenantName] = useState('Tenant');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        setIsLoading(true);
        await fetchTenants();
        await fetchProducts(tenantId);
        await fetchProductTypes();
        setSelectedTenantId(tenantId);
        setIsLoading(false);
    }
    loadData();
  }, [tenantId, fetchTenants, fetchProducts, fetchProductTypes, setSelectedTenantId]);
  
  const tenant = getTenantById(tenantId);
  
  useEffect(() => {
    if(tenant) {
      setTenantName(tenant.name);
    }
  }, [tenant]);

  const tenantProducts = products.filter(
    (p) => p.tenant_id === tenantId
  );

  const getProductTypeName = (typeId: number | null) => {
    return productTypes.find(pt => pt.id === typeId)?.name || 'N/A';
  }

  const handleDelete = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <Button asChild variant="outline" size="icon">
          <Link href={`/tenants/${tenantId}`}>
            <ArrowLeft />
            <span className="sr-only">Back to Tenant</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Products</h1>
          <p className="text-muted-foreground">For {tenantName}</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Product List</CardTitle>
            <CardDescription>
              Here you can edit or delete existing products for this tenant.
            </CardDescription>
          </div>
           <Button onClick={() => setIsAddProductOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Buying Price</TableHead>
                <TableHead className="text-right">Selling Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                 <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading products...
                  </TableCell>
                </TableRow>
              ) : tenantProducts.length > 0 ? (
                tenantProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{getProductTypeName(product.product_type_id)}</TableCell>
                    <TableCell className="text-right font-mono">Rs {product.buying_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-mono">Rs {product.selling_price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" className="mr-2" onClick={() => setProductToEdit(product)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setProductToDelete(product)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No products found for this tenant.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!productToDelete}
        onOpenChange={(isOpen) => !isOpen && setProductToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product "{productToDelete?.name}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Product Dialog */}
      {productToEdit && (
         <EditProductDialog
            isOpen={!!productToEdit}
            onOpenChange={(isOpen) => !isOpen && setProductToEdit(null)}
            product={productToEdit}
        />
      )}

       {/* Add Product Dialog */}
       <AddProductDialog 
        isOpen={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        tenantId={tenantId}
      />
    </>
  );
}
