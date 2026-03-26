'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signOut } = useAuth();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        signOut();
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.'
        });
      } catch (error) {
        console.error('Logout failed:', error);
        toast({
          variant: 'destructive',
          title: 'Logout Failed',
          description: 'Something went wrong. Please try again.'
        });
      } finally {
        // Redirect to homepage after attempting to sign out
        router.push('/');
      }
    };
    performSignOut();
  }, [router, toast]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))' }}>
      <p style={{ fontSize: '1.25rem', color: 'hsl(var(--muted-foreground))', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>Logging you out...</p>
    </div>);

}