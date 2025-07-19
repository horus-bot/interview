'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export default function LogoutPage() {
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const performSignOut = async () => {
      try {
        await signOut(auth);
        toast({
          title: 'Logged Out',
          description: 'You have been successfully logged out.',
        });
      } catch (error) {
        console.error('Logout failed:', error);
        toast({
          variant: 'destructive',
          title: 'Logout Failed',
          description: 'Something went wrong. Please try again.',
        });
      } finally {
        // Redirect to homepage after attempting to sign out
        router.push('/');
      }
    };
    performSignOut();
  }, [router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging you out...</p>
    </div>
  );
}
