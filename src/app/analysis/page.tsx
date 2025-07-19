'use client';

import { useState, useEffect } from 'react';
import { useRouter, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { withAuth } from '@/context/auth-context';

function AnalysisPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ReasoningAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // This effect should only run on the client side.
    if (typeof window !== 'undefined') {
      try {
        const storedVideoUrl = sessionStorage.getItem('videoUrl');
        const storedTranscript = sessionStorage.getItem('transcript');
        const storedAnalysis = sessionStorage.getItem('analysisResult');
        
        if (storedVideoUrl && storedTranscript && storedAnalysis) {
          setVideoUrl(storedVideoUrl);
          setTranscript(storedTranscript);
          setAnalysis(JSON.parse(storedAnalysis));
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
  }, []);

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto animate-pulse">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <Skeleton className="w-full aspect-video rounded-lg" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !analysis || !videoUrl || !transcript) {
    // Redirecting on the client side if data is missing
    if (typeof window !== 'undefined') {
       router.push('/upload');
    }
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">No Analysis Found</h2>
        <p className="text-muted-foreground mb-8">
          Redirecting you to the upload page to start an analysis.
        </p>
         <Button onClick={() => router.push('/upload')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go to Upload
        </Button>
      </div>
    );
  }

  return <AnalysisDashboard videoUrl={videoUrl} transcript={transcript} analysis={analysis} />;
}


export default withAuth(AnalysisPage);
