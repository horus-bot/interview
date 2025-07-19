
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { withAuth } from '@/context/auth-context';
import type { AnalyzeCodingAttemptOutput } from '@/ai/flows/coding-interview-flow';

function AnalysisPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReasoningAnalysisOutput | AnalyzeCodingAttemptOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This effect runs once on mount to get data from sessionStorage
    try {
      const videoUrlFromSession = sessionStorage.getItem('videoUrl');
      const storedAnalysis = sessionStorage.getItem('analysisResult');

      if (videoUrlFromSession && storedAnalysis) {
        setVideoUrl(videoUrlFromSession);
        setAnalysis(JSON.parse(storedAnalysis));
      } else {
        // If data is missing, we set an error to redirect.
        setError('Analysis data not found. Redirecting...');
      }
    } catch (e) {
      console.error("Failed to load data from session storage:", e);
      setError('Failed to load analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
    
    // Cleanup function to revoke the object URL
    return () => {
        const videoUrlFromSession = sessionStorage.getItem('videoUrl');
        if (videoUrlFromSession) {
            URL.revokeObjectURL(videoUrlFromSession);
        }
    }
  }, []);

  useEffect(() => {
    // This effect handles redirection if data is missing after the initial load.
    if (!isLoading && error) {
      setTimeout(() => {
        // Redirect to a safe page if there's an error
        const analysisType = sessionStorage.getItem('analysisType');
        if (analysisType === 'coding') {
          router.push('/interview/coding');
        } else {
          router.push('/upload');
        }
      }, 2000); // Give user time to read the message
    }
  }, [isLoading, error, router]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
        <div className="flex justify-between items-center mb-8">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3 space-y-8">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
          <div className="md:col-span-2">
            <Skeleton className="h-[48rem] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis || !videoUrl) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">Error Loading Analysis</h2>
        <p className="text-muted-foreground mb-8">
          {error || 'Could not find analysis data. Redirecting you to start a new one.'}
        </p>
         <Button onClick={() => router.push('/upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Upload
        </Button>
      </div>
    );
  }

  return <AnalysisDashboard videoUrl={videoUrl} analysis={analysis} />;
}


export default withAuth(AnalysisPage);
