
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signUpWithEmailAndPassword as signUpLocal } from '@/lib/local-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Bot, UserPlus } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.')
});



export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    try {
      signUpLocal(data.email, data.password);

      toast({
        title: 'Account Created',
        description: "You've been successfully signed up!"
      });

      router.push('/my-analyses');
    } catch (error) {
      if (error?.message === 'EMAIL_ALREADY_IN_USE') {
        toast({
          variant: 'destructive',
          title: 'Sign Up Failed',
          description: 'This email address is already in use.'
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: 'Unable to create account. Please try again.'
      });
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))', padding: '1rem', position: 'relative' }}>
       <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
          <Button asChild variant="outline">
              <Link href="/" style={{ textDecoration: 'none' }}>
                  Back to Home
              </Link>
          </Button>
      </div>
      <Card style={{ width: '100%', maxWidth: '400px', padding: '2rem', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
        <CardHeader style={{ textAlign: 'center', paddingBottom: '2rem' }}>
          <CardTitle style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '1.75rem', color: 'hsl(var(--primary))' }}>
            <Bot size={40} style={{ color: 'hsl(var(--primary))', marginBottom: '0.5rem' }} />
            Create an Account
          </CardTitle>
          <CardDescription style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Join Interview Insights to start improving.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) =>
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormLabel style={{ fontWeight: 600 }}>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }} />
                    </FormControl>
                    <FormMessage style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem' }} />
                  </FormItem>
                } />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) =>
                <FormItem style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <FormLabel style={{ fontWeight: 600 }}>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))' }} />
                    </FormControl>
                    <FormMessage style={{ color: 'hsl(var(--destructive))', fontSize: '0.8rem' }} />
                  </FormItem>
                } />
              
              <Button type="submit" disabled={form.formState.isSubmitting} style={{ width: '100%', marginTop: '1rem', padding: '0.75rem', fontSize: '1rem', borderRadius: '0.5rem' }}>
                {form.formState.isSubmitting ? 'Creating Account...' : 'Sign Up'}
                <UserPlus size={18} style={{ marginLeft: '0.5rem' }} />
              </Button>
            </form>
          </Form>
          <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'hsl(var(--primary))', textDecoration: 'none', fontWeight: 600 }}>
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>);

}