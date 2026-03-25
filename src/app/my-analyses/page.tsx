
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
    <div >
      <header >
        <div >
          <h1 >
            <BarChart2 /> My Analyses
          </h1>
          <div >
             <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
            </Button>
            <Button onClick={() => router.push('/upload')}>
              <PlusCircle  />
              Start New Analysis
            </Button>
          </div>
        </div>
      </header>

      <main >
        {analyses.length === 0 ? (
          <div >
            <h2 >No Analyses Yet!</h2>
            <p >
              It looks like you haven't analyzed any interviews.
            </p>
            <Button size="lg" onClick={() => router.push('/upload')}>
              <PlusCircle  />
              Analyze Your First Interview
            </Button>
          </div>
        ) : (
          <div >
            {/* When data is available, you would map over it here to render analysis cards */}
          </div>
        )}
      </main>
    </div>
  );
}

export default withAuth(MyAnalysesPage);
