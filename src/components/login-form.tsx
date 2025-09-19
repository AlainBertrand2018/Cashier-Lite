
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
import { AlertCircle, Loader2 } from 'lucide-react';
import type { Cashier } from '@/lib/types';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';


const cashierFormSchema = z.object({
  cashierId: z.string().min(1, { message: 'Please select a cashier.' }),
  pin: z.string().length(4, { message: 'PIN must be 4 digits.' }),
  floatAmount: z.coerce.number().min(0, { message: 'Float must be a positive number.' }),
});

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password cannot be empty.' }),
});

const adminSignUpSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function LoginForm() {
  const { cashiers, fetchCashiers, fetchEvents, activeEvent, startShift, adminLogin, adminSignUp } = useStore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminTab, setAdminTab] = useState('login');

  useEffect(() => {
    fetchCashiers(true);
    fetchEvents(true); // Fetches all events and finds the active one
  }, [fetchCashiers, fetchEvents]);

  const cashierForm = useForm<z.infer<typeof cashierFormSchema>>({
    resolver: zodResolver(cashierFormSchema),
    defaultValues: {
      cashierId: '',
      pin: '',
      floatAmount: 0,
    },
  });

  const adminLoginForm = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const adminSignUpForm = useForm<z.infer<typeof adminSignUpSchema>>({
    resolver: zodResolver(adminSignUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onCashierSubmit(values: z.infer<typeof cashierFormSchema>) {
    if (!activeEvent) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'No active event has been set by an administrator.',
      });
      return;
    }

    setIsSubmitting(true);
    const success = await startShift(activeEvent.id, values.cashierId, values.pin, values.floatAmount);
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

  async function onAdminLoginSubmit(values: z.infer<typeof adminLoginSchema>) {
    setIsSubmitting(true);
    const { success, error } = await adminLogin(values.email, values.password);
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
        description: error || 'Invalid email or password.',
      });
      adminLoginForm.setError('password', { message: 'Invalid credentials' });
    }
  }

   async function onAdminSignUpSubmit(values: z.infer<typeof adminSignUpSchema>) {
    setIsSubmitting(true);
    const { success, error } = await adminSignUp(values.email, values.password);
    setIsSubmitting(false);

    if (success) {
      toast({
        title: 'Sign Up Successful',
        description: 'Please check your email to confirm your account.',
      });
      adminSignUpForm.reset();
      setAdminTab('login');
    } else {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error || 'Could not create account. Please try again.',
      });
      adminSignUpForm.setError('email', { message: error || 'Sign up failed' });
    }
  }
  
  const isCashierLoginDisabled = !activeEvent || isSubmitting;


  return (
    <Card>
      <CardContent className="p-0">
        <Tabs defaultValue="cashier" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cashier">Cashier Login</TabsTrigger>
            <TabsTrigger value="admin">Admin Login</TabsTrigger>
          </TabsList>
          <TabsContent value="cashier" className="p-6">
             {!activeEvent ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Active Event</AlertTitle>
                  <AlertDescription>
                    An administrator has not set an active event. Cashier login is disabled.
                  </AlertDescription>
                </Alert>
             ) : (
                <Form {...cashierForm}>
                  <form onSubmit={cashierForm.handleSubmit(onCashierSubmit)} className="space-y-6">
                    <FormItem>
                      <FormLabel>Active Event</FormLabel>
                      <FormControl>
                        <Input readOnly value={activeEvent.name} />
                      </FormControl>
                    </FormItem>
                    
                    <FormField
                      control={cashierForm.control}
                      name="cashierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cashier Name</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isCashierLoginDisabled}>
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
                            <Input type="password" placeholder="****" {...field} maxLength={4} disabled={isCashierLoginDisabled}/>
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
                            <Input type="number" step="0.01" {...field} disabled={isCashierLoginDisabled} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isCashierLoginDisabled}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isSubmitting ? 'Logging In...' : 'Start Shift & Login'}
                    </Button>
                  </form>
                </Form>
             )}
          </TabsContent>
          <TabsContent value="admin" className="p-0">
             <Tabs defaultValue="login" value={adminTab} onValueChange={setAdminTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                 <TabsContent value="login" className="p-6">
                    <Form {...adminLoginForm}>
                        <form onSubmit={adminLoginForm.handleSubmit(onAdminLoginSubmit)} className="space-y-6">
                            <FormField
                            control={adminLoginForm.control}
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
                            control={adminLoginForm.control}
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
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
                <TabsContent value="signup" className="p-6">
                     <Form {...adminSignUpForm}>
                        <form onSubmit={adminSignUpForm.handleSubmit(onAdminSignUpSubmit)} className="space-y-6">
                            <FormField
                            control={adminSignUpForm.control}
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
                            control={adminSignUpForm.control}
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
                            {isSubmitting ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </form>
                    </Form>
                </TabsContent>
             </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
