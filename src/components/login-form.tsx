
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Loader2 } from 'lucide-react';
import type { Cashier } from '@/lib/types';
import { Card, CardContent } from './ui/card';

const formSchema = z.object({
  cashierId: z.string().min(1, { message: 'Please select a cashier.' }),
  pin: z.string().length(4, { message: 'PIN must be 4 digits.' }),
  floatAmount: z.coerce.number().min(0, { message: 'Float must be a positive number.' }),
});

export default function LoginForm() {
  const { cashiers, fetchCashiers, startShift } = useStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCashiers(true); // Force fetch cashiers on login form mount
  }, [fetchCashiers]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cashierId: '',
      pin: '',
      floatAmount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const success = await startShift(values.cashierId, values.pin, values.floatAmount);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Shift Started',
        description: 'You have been successfully logged in.',
      });
      // The redirect will be handled by the layout component
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid cashier or PIN. Please try again.',
      });
      form.setError('pin', { message: 'Invalid PIN' });
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="cashierId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cashier Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cashier to login" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {cashiers.map((cashier: Cashier) => (
                        <SelectItem key={cashier.id} value={cashier.id}>
                          {cashier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>4-Digit PIN</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="****" {...field} maxLength={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="floatAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Starting Float (Rs)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Logging In...' : 'Start Shift & Login'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
