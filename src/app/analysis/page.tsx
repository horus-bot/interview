
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { withAuth } from '@/context/auth-context';

function AnalysisPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReasoningAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Prevent memory leaks on URL.createObjectURL
    const videoUrlFromSession = sessionStorage.getItem('videoUrl');
    if (videoUrlFromSession) {
        setVideoUrl(videoUrlFromSession);
    }
    
    return () => {
        if (videoUrlFromSession) {
            URL.revokeObjectURL(videoUrlFromSession);
        }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedAnalysis = sessionStorage.getItem('analysisResult');
        
        if (videoUrl && storedAnalysis) {
          setAnalysis(JSON.parse(storedAnalysis));
        } else if (!videoUrl) {
            // If videoUrl is still null, it might be loading, or it might be missing
        } else {
             setError(true);
        }
      } catch (e) {
        console.error("Failed to parse analysis data from session storage:", e);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    }
  }, [videoUrl]);

  useEffect(() => {
    // Client-side redirect if data is missing after loading
    if (!isLoading && (!analysis || !videoUrl)) {
      router.push('/upload');
    }
  }, [isLoading, analysis, videoUrl, router]);

  if (isLoading || !videoUrl) {
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

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">No Analysis Found</h2>
        <p className="text-muted-foreground mb-8">
          It looks like there's no analysis data available. Redirecting you to start a new one.
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
