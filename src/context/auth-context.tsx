'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const WithAuthComponent = (props: P) => {
        const { user, loading } = useAuth();
        const [isClient, setIsClient] = useState(false);

        useEffect(() => {
            setIsClient(true);
        }, []);

        useEffect(() => {
            if (isClient && !loading && !user) {
                window.location.href = '/login';
            }
        }, [user, loading, isClient]);

        if (loading || !user) {
            return (
                <div className="flex items-center justify-center min-h-screen">
                    <div className="p-8 space-y-4">
                        <Skeleton className="h-12 w-64" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
    WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithAuthComponent;
}
