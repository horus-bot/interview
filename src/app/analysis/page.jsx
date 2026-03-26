'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { withAuth } from '@/context/auth-context';
import { Sparkles } from 'lucide-react';
import { ExpertChatbot } from '@/components/ExpertChatbot';

function AnalysisPage() {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const videoUrlFromSession = sessionStorage.getItem('videoUrl');
      const storedAnalysis = sessionStorage.getItem('analysisResult');

      if (videoUrlFromSession && storedAnalysis) {
        setVideoUrl(videoUrlFromSession);
        setAnalysis(JSON.parse(storedAnalysis));
      } else {
        setError('Analysis data not found. Redirecting...');
      }
    } catch (e) {
      console.error("Failed to load data from session storage:", e);
      setError('Failed to load analysis. Please try again.');
    } finally {
      // Simulate synthesis time for UX
      setTimeout(() => setIsLoading(false), 2000);
    }

    return () => {
      const videoUrlFromSession = sessionStorage.getItem('videoUrl');
      if (videoUrlFromSession) {
        URL.revokeObjectURL(videoUrlFromSession);
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading && error) {
      setTimeout(() => {
        const analysisType = sessionStorage.getItem('analysisType');
        if (analysisType === 'coding') {
          router.push('/interview/coding');
        } else {
          router.push('/upload');
        }
      }, 2000);
    }
  }, [isLoading, error, router]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020617', color: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)' }}>
          <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ height: '2rem', width: '10rem', background: 'linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ height: '2.5rem', width: '6rem', background: 'linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
              <div style={{ height: '2.5rem', width: '7rem', background: 'linear-gradient(90deg, #1E293B 0%, #334155 50%, #1E293B 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear', borderRadius: '0.5rem' }} />
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '80rem', margin: '4rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translate(-50%, -50%)', width: '40rem', height: '40rem', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

          <div style={{ zIndex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ position: 'relative', width: '4rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ position: 'absolute', inset: 0, border: '3px solid rgba(16, 185, 129, 0.2)', borderRadius: '50%', borderTopColor: '#10B981', animation: 'spin 1s linear infinite' }} />
              <Sparkles style={{ color: '#10B981', animation: 'pulse 2s infinite' }} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '0 0 1rem 0', letterSpacing: '-0.03em', background: 'linear-gradient(to bottom, #FFFFFF, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Synthesizing Interview Intelligence
            </h2>
            <p style={{ color: '#94A3B8', fontSize: '1.125rem', maxWidth: '32rem', margin: 0 }}>
              Our AI is currently processing your video frames, speech patterns, and technical response quality...
            </p>
          </div>

          <div style={{ zIndex: 1, display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 44rem', display: 'grid', gap: '2rem' }}>
              <div style={{ overflow: 'hidden', borderRadius: '1.5rem', border: '1px solid #1E293B', backgroundColor: '#0F172A' }}>
                <div style={{ width: '100%', aspectRatio: '16/9', background: 'linear-gradient(90deg, #020617 0%, #1E293B 50%, #020617 100%)', backgroundSize: '200% 100%', animation: 'shimmer 2s infinite linear' }} />
              </div>
            </div>

            <div style={{ flex: '1 1 20rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ borderRadius: '1.5rem', border: '1px solid #1E293B', backgroundColor: '#0F172A', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ height: '1.5rem', width: '60%', background: '#1E293B', borderRadius: '0.5rem' }} />
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ height: '4rem', width: '100%', background: '#1E293B', borderRadius: '1rem', opacity: 1 - i * 0.2 }} />
                ))}
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
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.1); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
        ` }} />
      </div>);
  }

  if (error || !analysis || !videoUrl) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '1.5rem', backgroundColor: '#020617', fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '50vw', height: '50vh', background: 'radial-gradient(circle, rgba(239, 68, 68, 0.05) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, backgroundColor: '#0F172A', borderRadius: '1.5rem', padding: '3.5rem 2.5rem', maxWidth: '30rem', width: '100%', textAlign: 'center', border: '1px solid #1E293B', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', animation: 'slideUp 0.4s ease-out' }}>
          <div style={{ width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
            <span style={{ fontSize: '2rem' }}>⚠️</span>
          </div>
          
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 1rem 0', color: '#F8FAFC', letterSpacing: '-0.025em' }}>
            Analysis Not Found
          </h2>
          
          <p style={{ color: '#94A3B8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            {error || "We couldn't locate the analysis data for this session. It may have expired or was interrupted. Redirecting you shortly."}
          </p>
          
          <button
            onClick={() => router.push('/upload')}
            style={{ 
              width: '100%', 
              padding: '1rem', 
              backgroundColor: '#334155', 
              color: '#F8FAFC', 
              border: 'none', 
              borderRadius: '0.75rem', 
              fontSize: '1rem', 
              fontWeight: 700, 
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}>
            Return to Dashboard
          </button>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        ` }} />
      </div>);
  }

  return (
    <>
      <AnalysisDashboard videoUrl={videoUrl} analysis={analysis} />
      <ExpertChatbot analysis={analysis} />
    </>
  );
}

export default withAuth(AnalysisPage);