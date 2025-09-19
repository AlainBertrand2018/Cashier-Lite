
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
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from './ui/textarea';
import { useState, useEffect } from 'react';
import type { Tenant } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Tenant name must be at least 2 characters.',
  }),
  responsibleParty: z.string().min(2, {
    message: 'Responsible party must be at least 2 characters.',
  }),
  brn: z.string().optional(),
  vat: z.string().optional(),
  mobile: z.string().min(1, { message: 'Mobile number is required.' }),
  address: z.string().optional(),
  revenue_share_percentage: z.coerce.number().min(0).max(100, {
    message: 'Percentage must be between 0 and 100.',
  }),
});

interface EditTenantDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  tenant: Tenant;
}

export default function EditTenantDialog({ isOpen, onOpenChange, tenant }: EditTenantDialogProps) {
  const editTenant = useStore((state) => state.editTenant);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tenant.name,
      responsibleParty: tenant.responsibleParty,
      brn: tenant.brn || '',
      vat: tenant.vat || '',
      mobile: tenant.mobile,
      address: tenant.address || '',
      revenue_share_percentage: tenant.revenue_share_percentage,
    },
  });

  useEffect(() => {
    form.reset({
      name: tenant.name,
      responsibleParty: tenant.responsibleParty,
      brn: tenant.brn || '',
      vat: tenant.vat || '',
      mobile: tenant.mobile,
      address: tenant.address || '',
      revenue_share_percentage: tenant.revenue_share_percentage,
    });
  }, [tenant, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await editTenant(tenant.tenant_id, values);
    setIsSubmitting(false);

    toast({
      title: 'Tenant Updated',
      description: `Tenant "${values.name}" has been successfully updated.`,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Tenant</DialogTitle>
          <DialogDescription>
            Update the details for "{tenant.name}".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Tenant Name *</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Mama's Kitchen" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="responsibleParty"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Responsible Party *</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="brn"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>BRN</FormLabel>
                    <FormControl>
                        <Input placeholder="Business Registration No." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="vat"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>VAT Number</FormLabel>
                    <FormControl>
                        <Input placeholder="VAT Registration No." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
             <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 5123 4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="revenue_share_percentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Revenue Share % *</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="e.g., 70.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
             </div>
             <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter full address" {...field} />
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
      </DialogContent>
    </Dialog>
  );
}
