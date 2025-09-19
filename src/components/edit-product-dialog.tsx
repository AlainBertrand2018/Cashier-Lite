
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Separator } from './ui/separator';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Product name must be at least 2 characters.',
  }),
  product_type_id: z.coerce.number().min(1, {
    message: 'Please select a product type.',
  }),
  buying_price: z.coerce.number().min(0, {
    message: 'Buying price must be a positive number.',
  }),
  selling_price: z.coerce.number().min(0, {
    message: 'Selling price must be a positive number.',
  }),
  stock: z.coerce.number().int().min(0, {
    message: 'Stock must be a positive integer.',
  }),
});

interface EditProductDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product;
}

export default function EditProductDialog({ isOpen, onOpenChange, product }: EditProductDialogProps) {
  const { editProduct, productTypes, fetchProductTypes, addStock } = useStore((state) => ({
    editProduct: state.editProduct,
    productTypes: state.productTypes,
    fetchProductTypes: state.fetchProductTypes,
    addStock: state.addStock,
  }));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addStockQuantity, setAddStockQuantity] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchProductTypes();
    }
  }, [isOpen, fetchProductTypes]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: product.name,
      product_type_id: product.product_type_id || 0,
      buying_price: product.buying_price,
      selling_price: product.selling_price,
      stock: product.stock,
    },
  });

  useEffect(() => {
    form.reset({
      name: product.name,
      product_type_id: product.product_type_id || 0,
      buying_price: product.buying_price,
      selling_price: product.selling_price,
      stock: product.stock,
    });
  }, [product, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await editProduct(product.id, values);
    setIsSubmitting(false);

    toast({
      title: 'Product Updated',
      description: `Product "${values.name}" has been updated.`,
    });
    onOpenChange(false);
  }

  const handleAddStock = async () => {
    if (addStockQuantity > 0) {
      setIsSubmitting(true);
      await addStock(product.id, addStockQuantity);
      setIsSubmitting(false);
      toast({
        title: 'Stock Added',
        description: `${addStockQuantity} units added to "${product.name}".`,
      });
      setAddStockQuantity(0);
      onOpenChange(false);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update product details or add new stock. Changing 'Current Stock' will reset the initial stock value.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Large Coke" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="product_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Type</FormLabel>
                   <Select onValueChange={field.onChange} value={String(field.value || '')}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="buying_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buying Price (Rs)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling Price (Rs)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Stock</FormLabel>
                  <FormControl>
                    <Input type="number" step="1" {...field} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <Separator />
         <div className="space-y-2">
            <h4 className="font-medium">Add New Stock</h4>
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                placeholder="Quantity to add"
                value={addStockQuantity || ''}
                onChange={(e) => setAddStockQuantity(parseInt(e.target.value, 10) || 0)}
                className="flex-1"
                disabled={isSubmitting}
              />
              <Button onClick={handleAddStock} disabled={isSubmitting || addStockQuantity <= 0}>
                <Plus className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </div>
          </div>
      </DialogContent>
    </Dialog>
  );
}
