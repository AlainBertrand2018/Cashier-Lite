
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';


const cashierFormSchema = z.object({
  cashierId: z.string().min(1, { message: 'Please select a cashier.' }),
  pin: z.string().length(4, { message: 'PIN must be 4 digits.' }),
  floatAmount: z.coerce.number().min(0, { message: 'Float must be a positive number.' }),
});

const adminFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

export default function LoginForm() {
  const { cashiers, fetchCashiers, startShift, adminLogin } = useStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCashiers(true);
  }, [fetchCashiers]);

  const cashierForm = useForm<z.infer<typeof cashierFormSchema>>({
    resolver: zodResolver(cashierFormSchema),
    defaultValues: {
      cashierId: '',
      pin: '',
      floatAmount: 0,
    },
  });

  const adminForm = useForm<z.infer<typeof adminFormSchema>>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onCashierSubmit(values: z.infer<typeof cashierFormSchema>) {
    setIsSubmitting(true);
    const success = await startShift(values.cashierId, values.pin, values.floatAmount);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Shift Started',
        description: 'You have been successfully logged in.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid cashier or PIN. Please try again.',
      });
      cashierForm.setError('pin', { message: 'Invalid PIN' });
    }
  }

  async function onAdminSubmit(values: z.infer<typeof adminFormSchema>) {
    setIsSubmitting(true);
    const success = await adminLogin(values.email, values.password);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Admin Login Successful',
        description: 'Welcome to the admin dashboard.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid email or password.',
      });
      adminForm.setError('password', { message: 'Invalid credentials' });
    }
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="cashier" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cashier">Cashier Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          <TabsContent value="cashier" className="p-6">
             <Form {...cashierForm}>
              <form onSubmit={cashierForm.handleSubmit(onCashierSubmit)} className="space-y-6">
                <FormField
                  control={cashierForm.control}
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
                  control={cashierForm.control}
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
                  control={cashierForm.control}
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
          </TabsContent>
          <TabsContent value="admin" className="p-6">
             <Form {...adminForm}>
                <form onSubmit={adminForm.handleSubmit(onAdminSubmit)} className="space-y-6">
                    <FormField
                    control={adminForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input placeholder="admin@fids.mu" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={adminForm.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Logging In...' : 'Admin Login'}
                    </Button>
                </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
