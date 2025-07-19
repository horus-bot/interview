
'use client';

import { withAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PlusCircle, BarChart2 } from 'lucide-react';
import Link from 'next/link';

function MyAnalysesPage() {
  const router = useRouter();

  // Placeholder data - in a real app, this would come from a database
  const analyses: any[] = [];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <BarChart2 /> My Analyses
          </h1>
          <div className="flex items-center gap-2">
             <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
            </Button>
            <Button onClick={() => router.push('/upload')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Start New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {analyses.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-2xl font-semibold text-primary">No Analyses Yet!</h2>
            <p className="text-muted-foreground mt-2 mb-6">
              It looks like you haven't analyzed any interviews.
            </p>
            <Button size="lg" onClick={() => router.push('/upload')}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Analyze Your First Interview
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* When data is available, you would map over it here to render analysis cards */}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(MyAnalysesPage);
