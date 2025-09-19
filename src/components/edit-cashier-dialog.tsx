
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
import { useState, useEffect } from 'react';
import type { Cashier, CashierRole } from '@/lib/types';

const cashierRoles: CashierRole[] = ['Bar', 'Entrance', 'Other'];

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Cashier name must be at least 2 characters.',
  }),
  pin: z.string().optional(),
  role: z.enum(cashierRoles, {
    required_error: 'Please select a role for the cashier.',
  }),
});

interface EditCashierDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cashier: Cashier;
}

export default function EditCashierDialog({ isOpen, onOpenChange, cashier }: EditCashierDialogProps) {
  const { editCashier } = useStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: cashier.name,
      pin: '',
      role: cashier.role,
    },
  });

  useEffect(() => {
    form.reset({
      name: cashier.name,
      pin: '',
      role: cashier.role,
    });
  }, [cashier, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Filter out empty pin so it's not updated if left blank
    const updateData: Partial<Cashier> = {
      name: values.name,
      role: values.role,
    };
    if (values.pin) {
      updateData.pin = values.pin;
    }

    const success = await editCashier(cashier.id, updateData);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Cashier Updated',
        description: `Details for "${values.name}" have been updated.`,
      });
      onOpenChange(false);
    } else {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update cashier. Please check the console.',
      });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Cashier</DialogTitle>
          <DialogDescription>
            Update details for {cashier.name}. Leave PIN blank to keep it unchanged.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashier Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Smith" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New 4-Digit PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="****"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {cashierRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
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
