
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
});

interface AddTenantDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export default function AddTenantDialog({ isOpen, onOpenChange }: AddTenantDialogProps) {
  const addTenant = useStore((state) => state.addTenant);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      responsibleParty: '',
      brn: '',
      vat: '',
      mobile: '',
      address: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newTenantId = addTenant(values);
    toast({
      title: 'Tenant Added',
      description: `Tenant "${values.name}" with ID ${newTenantId} has been created.`,
    });
    form.reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Tenant</DialogTitle>
          <DialogDescription>
            Enter the details for the new tenant. Fields marked with an asterisk are required.
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Tenant</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
