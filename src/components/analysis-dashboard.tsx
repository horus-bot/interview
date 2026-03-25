'use client';

import { Lightbulb, FileText, Download, BarChartHorizontal, Video, Mic, Code, MessageSquareQuote, CheckCircle, Sparkles, Gauge, TrendingUp } from 'lucide-react';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import type { AnalyzeCodingAttemptOutput } from '@/ai/flows/coding-interview-flow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';


type AnalysisDashboardInput = ReasoningAnalysisOutput | AnalyzeCodingAttemptOutput;

export function AnalysisDashboard({ videoUrl, analysis: initialAnalysis }: { videoUrl: string; analysis: AnalysisDashboardInput }) {
  const router = useRouter();

  const initial = initialAnalysis as Partial<ReasoningAnalysisOutput> & Record<string, any>;

  const analysis = initial;

  const groqScoreBreakdown = (analysis as any).scoreBreakdown || null;
  const hasGroqOverallScores = Boolean(groqScoreBreakdown);
  const hasVideoAnalysis = Boolean(analysis.videoAnalysis);
  const hasVocalAnalysis = Boolean(analysis.vocalAnalysis);
  const hasContentAnalysis = Boolean(analysis.contentAnalysis);
  const hasGuidance = Array.isArray(analysis.guidance) && analysis.guidance.length > 0;
  const hasTranscript = Boolean(analysis.transcript);
  const hasInterviewSummary = Boolean(analysis.interviewSummary);
  const isCodingAnalysis = Boolean(analysis.codingAnalysis);

  const videoScores = hasGroqOverallScores
    ? [
        { name: 'Visual Confidence', score: groqScoreBreakdown.visualConfidence ?? 0 },
        { name: 'Code Quality', score: groqScoreBreakdown.codeQuality ?? 0 },
        { name: 'Problem Solving', score: groqScoreBreakdown.problemSolving ?? 0 },
      ]
    : [];

  const vocalScores = hasGroqOverallScores
    ? [
        { name: 'Grammar', score: groqScoreBreakdown.grammar ?? 0 },
        { name: 'Fluency', score: groqScoreBreakdown.fluency ?? 0 },
      ]
    : [];

  const scoreItems = hasGroqOverallScores
    ? [
        { label: 'Code Quality', key: 'codeQuality', value: groqScoreBreakdown.codeQuality ?? 0, color: '#6366f1' },
        { label: 'Problem Solving', key: 'problemSolving', value: groqScoreBreakdown.problemSolving ?? 0, color: '#10b981' },
        { label: 'Visual Confidence', key: 'visualConfidence', value: groqScoreBreakdown.visualConfidence ?? 0, color: '#f59e0b' },
        { label: 'Grammar', key: 'grammar', value: groqScoreBreakdown.grammar ?? 0, color: '#ef4444' },
        { label: 'Fluency', key: 'fluency', value: groqScoreBreakdown.fluency ?? 0, color: '#0ea5e9' },
      ]
    : [];

  const overallScore = Math.max(0, Math.min(100, Number((analysis as any).score ?? 0)));
  const strongestMetric = scoreItems.length
    ? scoreItems.reduce((best, item) => (item.value > best.value ? item : best), scoreItems[0])
    : null;
  const averageMetric = scoreItems.length
    ? Math.round(scoreItems.reduce((sum, item) => sum + item.value, 0) / scoreItems.length)
    : 0;

  const handlePrint = () => window.print();

  // Navigation handlers for new pages
  const goToDeepAnalysis = () => router.push('/deep-analysis');
  const goToChatCoach = () => router.push('/chat-coach');




  return (
    <>
      <div
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(99,102,241,0.06) 0%, transparent 40%), radial-gradient(circle at 100% 100%, rgba(14,165,233,0.06) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(255,255,255,1) 0%, rgba(248,250,252,1) 100%)',
          color: '#0f172a',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 40,
            borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 4px 20px -8px rgba(15,23,42,0.08)',
            transition: 'all 0.3s ease'
          }}
        >
          <div
            style={{
              maxWidth: '80rem',
              margin: '0 auto',
              padding: '1rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
            }}
          >
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'hsl(var(--primary))', margin: 0, letterSpacing: '-0.05em' }}>Analysis Report</h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
              <Button onClick={() => router.push('/upload')} variant="outline" style={{ borderRadius: '0.5rem', fontWeight: 600 }}>
                Analyze Another
              </Button>
              <Button onClick={handlePrint} variant="secondary" style={{ borderRadius: '0.5rem', fontWeight: 600 }}>
                <Download size={16} style={{ marginRight: '0.5rem' }} />
                Export to PDF
              </Button>
              <Button onClick={goToDeepAnalysis} style={{ borderRadius: '0.5rem', fontWeight: 600, backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
                Deep Analysis
              </Button>
              <Button onClick={goToChatCoach} style={{ borderRadius: '0.5rem', fontWeight: 600, backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <Sparkles size={16} style={{ marginRight: '0.5rem' }} />
                Interview Coach
              </Button>
            </div>
          </div>
        </header>

        <main style={{ maxWidth: '85rem', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {isCodingAnalysis && hasGroqOverallScores && (
            <Card style={{ 
              borderRadius: '1.25rem', 
              border: '1px solid rgba(255,255,255,0.4)', 
              overflow: 'hidden', 
              background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 50%, #dcfce7 100%)', 
              boxShadow: '0 10px 40px -10px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.6)' 
            }}>
              <CardContent style={{ padding: '2rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ display: 'grid', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>Coding Performance Dashboard</p>
                        <h2 style={{ margin: '0.25rem 0 0 0', fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>Interview Score Insights</h2>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '9999px', backgroundColor: '#0f172a', color: '#fff', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}>
                        <Gauge size={18} /> Overall {overallScore}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                      <div style={{ borderRadius: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid rgba(99,102,241,0.1)', boxShadow: '0 4px 12px -4px rgba(99,102,241,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{overallScore}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/100</span></p>
                      </div>
                      <div style={{ borderRadius: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid rgba(16,185,129,0.1)', boxShadow: '0 4px 12px -4px rgba(16,185,129,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>{averageMetric}<span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>/100</span></p>
                      </div>
                      <div style={{ borderRadius: '1rem', padding: '1.25rem', backgroundColor: '#ffffff', border: '1px solid rgba(245,158,11,0.1)', boxShadow: '0 4px 12px -4px rgba(245,158,11,0.1)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Strongest</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{strongestMetric?.label ?? 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderRadius: '1.25rem', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 4px 24px -8px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '1.25rem' }}>Metric Snapshot</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
                      {scoreItems.slice(0, 3).map((item) => (
                        <div key={item.key} style={{ display: 'grid', justifyItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '64px',
                              height: '64px',
                              borderRadius: '9999px',
                              background: `conic-gradient(${item.color} ${item.value}%, #e2e8f0 0%)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ width: '48px', height: '48px', borderRadius: '9999px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                              {item.value}
                            </div>
                          </div>
                          <span style={{ fontSize: '0.75rem', textAlign: 'center', lineHeight: 1.3, fontWeight: 700, color: '#334155' }}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 44rem', display: 'grid', gap: '2rem' }}>
              <Card style={{ overflow: 'hidden', borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', backgroundColor: '#ffffff' }}>
                <CardContent style={{ padding: 0 }}>
                  <video
                    controls
                    src={videoUrl}
                    style={{ width: '100%', aspectRatio: '16/9', display: 'block', backgroundColor: '#0f172a', borderRadius: '1.25rem 1.25rem 0 0' }}
                  />
                </CardContent>
              </Card>

              {hasGroqOverallScores && (
              <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BarChartHorizontal size={18} style={{ color: 'hsl(var(--primary))' }} /> Overall Scores
                  </CardTitle>
                  <CardDescription>
                    Overall scoring controlled by Groq from code analysis, local API frame analysis (video proxy), and transcript analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 700 }}>Overall (Groq)</span>
                    <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{(analysis as any).score ?? 0}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
                    <div style={{ flex: '1 1 18rem' }}>
                      <h3 style={{ fontWeight: 700, margin: 0, marginBottom: '0.75rem' }}>Visual (Frame)</h3>
                      {videoScores.map((item) => (
                        <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '8rem 1fr 3rem', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>{item.name}</span>
                          <div style={{ backgroundColor: 'hsl(var(--muted))', borderRadius: '9999px', height: '0.75rem', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div
                              style={{
                                width: `${item.score}%`,
                                height: '100%',
                                backgroundColor: 'hsl(var(--primary))',
                                borderRadius: '9999px',
                                transition: 'width 350ms ease',
                              }}
                            />
                          </div>
                          <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>{item.score}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ flex: '1 1 18rem' }}>
                      <h3 style={{ fontWeight: 700, margin: 0, marginBottom: '0.75rem' }}>Audio Transcript</h3>
                      {vocalScores.map((item) => (
                        <div key={item.name} style={{ display: 'grid', gridTemplateColumns: '8rem 1fr 3rem', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>{item.name}</span>
                          <div style={{ backgroundColor: 'hsl(var(--muted))', borderRadius: '9999px', height: '0.75rem', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div
                              style={{
                                width: `${item.score}%`,
                                height: '100%',
                                backgroundColor: 'hsl(var(--primary))',
                                borderRadius: '9999px',
                                transition: 'width 350ms ease',
                              }}
                            />
                          </div>
                          <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>{item.score}</span>
                        </div>
                      ))}

                    </div>
                  </div>
                </CardContent>
              </Card>
              )}

              {hasGuidance && (
              <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lightbulb size={18} style={{ color: 'hsl(var(--primary))' }} /> Actionable Guidance
                  </CardTitle>
                  <CardDescription>Your top priorities for improvement based on the full analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.75rem' }}>
                    {(analysis.guidance || []).map((point, index) => (
                      <li key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                        <CheckCircle size={18} style={{ marginTop: '0.125rem', color: 'hsl(var(--primary))', flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.5 }}>{point}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              )}

              {isCodingAnalysis && analysis.codingAnalysis && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                  <CardHeader>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Code size={18} style={{ color: 'hsl(var(--primary))' }} /> Coding Analysis
                    </CardTitle>
                    <CardDescription>Detailed feedback on your technical solution.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
                      <div>
                        <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Correctness</dt>
                        <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.codingAnalysis.correctnessDescription}</dd>
                      </div>
                      <div>
                        <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Efficiency (Big O)</dt>
                        <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.codingAnalysis.efficiency}</dd>
                      </div>
                      <div>
                        <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Style & Readability</dt>
                        <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.codingAnalysis.styleAndReadability}</dd>
                      </div>
                      <div>
                        <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Alternative Approaches</dt>
                        <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.codingAnalysis.alternativeApproaches}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              )}

              {(analysis as any).scoreBreakdown && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                  <CardHeader>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <BarChartHorizontal size={18} style={{ color: 'hsl(var(--primary))' }} /> LLM Score Breakdown
                    </CardTitle>
                    <CardDescription>Groq scoring based on code, Gemini frame analysis, and browser STT transcript.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ margin: 0, fontSize: '0.86rem', color: 'hsl(var(--muted-foreground))', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Color Graph View</p>
                      <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '0.6rem', alignItems: 'end', minHeight: '140px', padding: '0.75rem', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '0.75rem', backgroundColor: 'rgba(241, 245, 249, 0.5)' }}>
                        {scoreItems.map((item) => (
                          <div key={`column-${item.key}`} style={{ display: 'grid', justifyItems: 'center', gap: '0.4rem' }}>
                            <div style={{ fontSize: '0.76rem', fontWeight: 800 }}>{item.value}</div>
                            <div style={{ width: '100%', height: '96px', display: 'flex', alignItems: 'flex-end' }}>
                              <div style={{ width: '100%', height: `${Math.max(8, item.value)}%`, borderRadius: '0.5rem 0.5rem 0.25rem 0.25rem', background: `linear-gradient(180deg, ${item.color} 0%, rgba(15,23,42,0.9) 130%)`, boxShadow: `0 8px 20px -12px ${item.color}`, transition: 'height 0.5s ease' }} />
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', textAlign: 'center', lineHeight: 1.25 }}>{item.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                      {[
                        { label: 'Code Quality', value: (analysis as any).scoreBreakdown.codeQuality, color: '#6366f1' },
                        { label: 'Problem Solving', value: (analysis as any).scoreBreakdown.problemSolving, color: '#10b981' },
                        { label: 'Visual Confidence', value: (analysis as any).scoreBreakdown.visualConfidence, color: '#f59e0b' },
                        { label: 'Grammar', value: (analysis as any).scoreBreakdown.grammar, color: '#ef4444' },
                        { label: 'Fluency', value: (analysis as any).scoreBreakdown.fluency, color: '#0ea5e9' },
                      ].map((item) => (
                        <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '10rem 1fr 3rem', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))' }}>{item.label}</span>
                          <div style={{ backgroundColor: 'hsl(var(--muted))', borderRadius: '9999px', height: '0.75rem', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)' }}>
                            <div
                              style={{
                                width: `${Math.max(0, Math.min(100, item.value || 0))}%`,
                                height: '100%',
                                backgroundColor: item.color,
                                borderRadius: '9999px',
                                transition: 'width 350ms ease',
                              }}
                            />
                          </div>
                          <span style={{ textAlign: 'right', fontWeight: 700, fontSize: '0.875rem' }}>{item.value ?? 0}</span>
                        </div>
                      ))}
                    </div>
                    {(analysis as any).visualFrameAnalysis && (
                      <div style={{ marginTop: '1rem' }}>
                        <h4 style={{ margin: 0, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
                          Visual Frame Analysis (Local API)
                        </h4>
                        <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>
                          {(analysis as any).visualFrameAnalysis}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {Array.isArray((analysis as any).questionByQuestionAnalysis) && (analysis as any).questionByQuestionAnalysis.length > 0 && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                  <CardHeader>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Code size={18} style={{ color: 'hsl(var(--primary))' }} /> Question-by-Question Analysis
                    </CardTitle>
                    <CardDescription>What was inferred for each interview question from code, speech, and visual analysis.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      {(analysis as any).questionByQuestionAnalysis.map((item: any, index: number) => (
                        <div
                          key={`${item.question}-${index}`}
                          style={{
                            border: '1px solid rgba(226, 232, 240, 0.8)',
                            borderRadius: '1rem',
                            padding: '1.25rem',
                            display: 'grid',
                            gap: '0.75rem',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 8px -2px rgba(15,23,42,0.05)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Q{index + 1}: {item.question}</h4>
                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>Score: {item.score}</span>
                          </div>
                          <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{item.findings}</p>
                          <dl style={{ display: 'grid', gap: '0.5rem', margin: 0 }}>
                            <div>
                              <dt style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Drawn from Code</dt>
                              <dd style={{ margin: 0, color: 'hsl(var(--muted-foreground))' }}>{item.drawnFrom?.code}</dd>
                            </div>
                            <div>
                              <dt style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Drawn from Speech</dt>
                              <dd style={{ margin: 0, color: 'hsl(var(--muted-foreground))' }}>{item.drawnFrom?.spokenExplanation}</dd>
                            </div>
                            <div>
                              <dt style={{ fontWeight: 700, color: 'hsl(var(--primary))' }}>Drawn from Visual Frame</dt>
                              <dd style={{ margin: 0, color: 'hsl(var(--muted-foreground))' }}>{item.drawnFrom?.visualFrame}</dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {hasTranscript && (
              <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} style={{ color: 'hsl(var(--primary))' }} /> Interview Transcript
                  </CardTitle>
                  <CardDescription>A full transcript of the interview, separated by speaker.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      maxHeight: '40rem',
                      overflowY: 'auto',
                      paddingRight: '1rem',
                      border: '1px solid rgba(226, 232, 240, 0.8)',
                      borderRadius: '1.25rem',
                      backgroundColor: 'rgba(248, 250, 252, 0.8)',
                      padding: '1.25rem',
                    }}
                  >
                    <p style={{ margin: 0, fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{analysis.transcript}</p>
                  </div>
                </CardContent>
              </Card>
              )}
            </div>

            <div style={{ flex: '1 1 22rem', display: 'grid', gap: '2rem' }}>
              {hasInterviewSummary && (
              <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp size={18} style={{ color: 'hsl(var(--primary))' }} /> Interview Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ margin: 0, color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{analysis.interviewSummary}</p>
                </CardContent>
              </Card>
              )}

              {(hasContentAnalysis || hasVideoAnalysis || hasVocalAnalysis) && (
              <Accordion type="multiple" defaultValue={['content-analysis', 'video-analysis', 'vocal-analysis']}>
                {hasContentAnalysis && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease', marginBottom: '1rem' }}>
                  <AccordionItem value="content-analysis" style={{ borderBottom: 'none' }}>
                    <AccordionTrigger style={{ padding: '1.5rem' }}>
                      <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MessageSquareQuote size={18} style={{ color: 'hsl(var(--primary))' }} /> Content Analysis
                      </CardTitle>
                    </AccordionTrigger>
                    <AccordionContent style={{ padding: '0 1.5rem 1.5rem' }}>
                      <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Answer Clarity & Structure</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.contentAnalysis?.answerClarity}</dd>
                        </div>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Relevance of Answers</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.contentAnalysis?.relevance}</dd>
                        </div>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Improvement Suggestions</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.contentAnalysis?.improvementSuggestions}</dd>
                        </div>
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
                )}

                {hasVideoAnalysis && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease', marginBottom: '1rem' }}>
                  <AccordionItem value="video-analysis" style={{ borderBottom: 'none' }}>
                    <AccordionTrigger style={{ padding: '1.5rem' }}>
                      <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Video size={18} style={{ color: 'hsl(var(--primary))' }} /> Video Analysis
                      </CardTitle>
                    </AccordionTrigger>
                    <AccordionContent style={{ padding: '0 1.5rem 1.5rem' }}>
                      <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Posture</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.videoAnalysis?.posture}</dd>
                        </div>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Body Language</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.videoAnalysis?.bodyLanguage}</dd>
                        </div>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Eye Contact</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.videoAnalysis?.eyeContact}</dd>
                        </div>
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
                )}

                {hasVocalAnalysis && (
                <Card style={{ borderRadius: '1.25rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.025), inset 0 1px 0 rgba(255,255,255,0.5)', border: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden', backgroundColor: '#ffffff', transition: 'box-shadow 0.3s ease' }}>
                  <AccordionItem value="vocal-analysis" style={{ borderBottom: 'none' }}>
                    <AccordionTrigger style={{ padding: '1.5rem' }}>
                      <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Mic size={18} style={{ color: 'hsl(var(--primary))' }} /> Vocal Analysis
                      </CardTitle>
                    </AccordionTrigger>
                    <AccordionContent style={{ padding: '0 1.5rem 1.5rem' }}>
                      <dl style={{ display: 'grid', gap: '1rem', margin: 0 }}>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Clarity</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.vocalAnalysis?.clarity}</dd>
                        </div>
                        <div>
                          <dt style={{ fontWeight: 800, color: 'hsl(var(--primary))' }}>Pacing</dt>
                          <dd style={{ margin: 0, marginTop: '0.25rem', color: 'hsl(var(--muted-foreground))' }}>{analysis.vocalAnalysis?.pacing}</dd>
                        </div>
                      </dl>
                    </AccordionContent>
                  </AccordionItem>
                </Card>
                )}
              </Accordion>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

