

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
import { useEffect, useState } from 'react';

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

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenantId: number | null;
}

export default function AddProductDialog({ isOpen, onOpenChange, tenantId }: AddProductDialogProps) {
  const { addProduct, productTypes, fetchProductTypes } = useStore((state) => ({
    addProduct: state.addProduct,
    productTypes: state.productTypes,
    fetchProductTypes: state.fetchProductTypes,
  }));
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProductTypes();
    }
  }, [isOpen, fetchProductTypes]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      product_type_id: 0,
      buying_price: 0,
      selling_price: 0,
      stock: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!tenantId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'No tenant selected.',
      });
      return;
    }
    setIsSubmitting(true);
    const newProduct = await addProduct({ ...values, tenant_id: tenantId });
    setIsSubmitting(false);

    if (newProduct) {
      toast({
        title: 'Product Added',
        description: `Product "${values.name}" has been added.`,
      });
      form.reset();
      onOpenChange(false);
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add product. Please check console for details.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <DialogDescription>
            Enter the details for the new product.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
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
                  <Select onValueChange={field.onChange} defaultValue={String(field.value)}>
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
                  <FormLabel>Stock</FormLabel>
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
                {isSubmitting ? 'Saving...' : 'Save Product'}
                </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
