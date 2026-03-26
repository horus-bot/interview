
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';



import { AnalysisDashboard } from '@/components/analysis-dashboard';

import { withAuth } from '@/context/auth-context';


function AnalysisPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    };
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
      <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card) / 0.85)', backdropFilter: 'blur(12px)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ height: '2.5rem', width: '12rem', background: 'linear-gradient(90deg, hsl(var(--muted)/0.6) 0%, hsl(var(--muted)) 50%, hsl(var(--muted)/0.6) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ height: '2.5rem', width: '8rem', background: 'linear-gradient(90deg, hsl(var(--muted)/0.6) 0%, hsl(var(--muted)) 50%, hsl(var(--muted)/0.6) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
              <div style={{ height: '2.5rem', width: '9rem', background: 'linear-gradient(90deg, hsl(var(--muted)/0.6) 0%, hsl(var(--muted)) 50%, hsl(var(--muted)/0.6) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '80rem', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
          {/* Animated Background Glow */}
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: '40rem', height: '40rem', background: 'radial-gradient(circle, hsl(var(--primary)/0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ zIndex: 1, textAlign: 'center', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ position: 'relative', width: '4rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid hsl(var(--primary)/0.3)', borderRadius: '50%', borderTopColor: 'hsl(var(--primary))', animation: 'spin 1.5s linear infinite' }} />
              <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', backgroundColor: 'hsl(var(--primary))', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
            </div>
            <h2 style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'hsl(var(--foreground))', letterSpacing: '-0.03em' }}>
              Assembling Your Report
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.125rem', maxWidth: '32rem', margin: 0 }}>
              Analyzing video frames, checking code quality, and formatting your overall interview feedback...
            </p>
          </div>

          <div style={{ zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 44rem', display: 'grid', gap: '2rem' }}>
              <div style={{ overflow: 'hidden', borderRadius: '1rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear' }} />
              </div>
              
              <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ height: '2rem', width: '14rem', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.375rem', marginBottom: '2rem' }} />
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                  <div style={{ height: '1.5rem', width: '100%', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.25rem' }} />
                  <div style={{ height: '1.5rem', width: '85%', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.25rem' }} />
                  <div style={{ height: '1.5rem', width: '90%', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.25rem' }} />
                </div>
              </div>
            </div>

            <div style={{ flex: '1 1 20rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', padding: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ height: '1.75rem', width: '10rem', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.375rem', marginBottom: '0.5rem' }} />
                {Array.from({ length: 4 }).map((_, i) =>
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ height: '1.25rem', width: '40%', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.25rem' }} />
                    <div style={{ height: '3rem', width: '100%', background: 'linear-gradient(90deg, hsl(var(--muted)/0.4) 0%, hsl(var(--muted)/0.8) 50%, hsl(var(--muted)/0.4) 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2.5s infinite linear', borderRadius: '0.5rem' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
        ` }} />
      </div>);

  }

  if (error || !analysis || !videoUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', backgroundColor: 'hsl(var(--background))', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {/* Glow effect */}
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50vw', height: '50vh', background: 'radial-gradient(circle, hsl(var(--destructive)/0.08) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, backgroundColor: 'hsl(var(--card))', borderRadius: '1.5rem', padding: '3.5rem 2.5rem', maxWidth: '30rem', width: '100%', textAlign: 'center', border: '1px solid hsl(var(--border))', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0,0,0,0.05)', animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', backgroundColor: 'hsl(var(--destructive)/0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '8px solid hsl(var(--background))', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1rem 0', color: 'hsl(var(--foreground))', letterSpacing: '-0.025em' }}>
            Analysis Not Found
          </h2>
          
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            {error || "We couldn't locate the analysis data for this session. It may have expired or was interrupted. Redirecting you shortly."}
          </p>
          
          <button
            onClick={() => router.push('/upload')}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '0.875rem 1.5rem', backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', border: 'none', borderRadius: '0.75rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 4px 14px -2px hsl(var(--primary)/0.4)' }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px -4px hsl(var(--primary)/0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px -2px hsl(var(--primary)/0.4)';
            }}>
            
            Return to Upload
          </button>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        ` }} />
      </div>);

  }

  return <AnalysisDashboard videoUrl={videoUrl} analysis={analysis} />;
}


export default withAuth(AnalysisPage);