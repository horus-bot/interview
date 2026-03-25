'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, getCurrentUser, signOutUser, subscribeAuthChange } from '@/lib/local-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    signOutUser();
  };

  useEffect(() => {
    const syncUser = () => {
      setUser(getCurrentUser());
      setLoading(false);
    };

    syncUser();
    const unsubscribe = subscribeAuthChange(syncUser);

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const WithAuthComponent = (props: P) => {
        const { user, loading } = useAuth();
        const router = useRouter();
        const [isVerifying, setIsVerifying] = useState(true);

        useEffect(() => {
            if (!loading) {
                if (!user) {
                    router.push('/login');
                } else {
                    setIsVerifying(false);
                }
            }
        }, [user, loading, router]);

        if (isVerifying) {
            return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--background))' }}>
              <div style={{ padding: '2rem', display: 'grid', gap: '1rem', width: '100%', maxWidth: '28rem' }}>
                <Skeleton style={{ height: '3rem', width: '100%' }} />
                <Skeleton style={{ height: '2rem', width: '100%' }} />
                <Skeleton style={{ height: '2rem', width: '83%' }} />
                <Skeleton style={{ height: '5rem', width: '100%' }} />
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
    WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithAuthComponent;
}
