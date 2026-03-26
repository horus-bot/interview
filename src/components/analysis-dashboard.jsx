'use client';

import { 
  Lightbulb, FileText, Download, BarChartHorizontal, Video, Mic, 
  Code, MessageSquareQuote, CheckCircle, Sparkles, Gauge, 
  TrendingUp, ArrowLeft, Brain, Target, ShieldCheck, Zap,
  Activity, Smile, UserCheck, Clock, Type, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function AnalysisDashboard({ videoUrl, analysis: initialAnalysis }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!initialAnalysis) return null;

  const analysis = initialAnalysis;
  const groqScoreBreakdown = analysis.scoreBreakdown || {};
  const overallScore = Math.max(0, Math.min(100, Number(analysis.score ?? 0)));
  const isCodingAnalysis = Boolean(analysis.codingAnalysis);
  const hasQuestions = Array.isArray(analysis.questionByQuestionAnalysis) && analysis.questionByQuestionAnalysis.length > 0;

  const performanceTimeline = analysis.performanceTimeline || [40, 55, 45, 70, 65, 80, 75, 85, 90, 85, 95, 100];
  const wpm = analysis.vocalAnalysis?.wordsPerMinute || 145;
  const sentimentScore = analysis.videoAnalysis?.sentimentScore || 85;

  const scoreItems = [
    { label: 'Code Quality', value: groqScoreBreakdown.codeQuality ?? 0, color: '#6366f1', icon: <Code size={16} /> },
    { label: 'Problem Solving', value: groqScoreBreakdown.problemSolving ?? 0, color: '#10b981', icon: <Target size={16} /> },
    { label: 'Confidence', value: groqScoreBreakdown.visualConfidence ?? 0, color: '#f59e0b', icon: <Zap size={16} /> },
    { label: 'Grammar', value: groqScoreBreakdown.grammar ?? 0, color: '#ef4444', icon: <FileText size={16} /> },
    { label: 'Fluency', value: groqScoreBreakdown.fluency ?? 0, color: '#0ea5e9', icon: <Mic size={16} /> }
  ].filter(item => isCodingAnalysis || (item.label !== 'Code Quality' && item.label !== 'Problem Solving'));

  const averageMetric = scoreItems.length ?
    Math.round(scoreItems.reduce((sum, item) => sum + item.value, 0) / scoreItems.length) : 0;

  const handlePrint = () => window.print();

  return (
    <div style={{ 
      backgroundColor: '#020617',
      color: '#F8FAFC',
      minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif',
      paddingBottom: '4rem'
    }}>
      {/* Dynamic Background Elements */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-5%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)', filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />

      <header style={{ 
        position: 'sticky',  top: 0, zIndex: 50, 
        backgroundColor: 'rgba(2, 6, 23, 0.8)', backdropFilter: 'blur(12px)', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)', padding: '0.75rem 1.5rem'
      }}>
        <div style={{ maxWidth: '90rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Button variant="ghost" size="icon" onClick={() => router.push('/my-analyses')} style={{ color: '#94A3B8' }}>
              <ArrowLeft size={20} />
            </Button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', background: 'linear-gradient(to right, #F8FAFC, #94A3B8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {isCodingAnalysis ? 'Coding Master Report' : 'Behavioral Intelligence Report'}
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#10B981', margin: 0, fontWeight: 700 }}>AI ANALYTICS ENGINE</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button onClick={handlePrint} variant="outline" style={{ border: '1px solid #334155', backgroundColor: 'transparent', color: '#F8FAFC', borderRadius: '0.75rem' }}>
              <Download size={16} />
            </Button>
            <Button onClick={() => router.push('/upload')} style={{ backgroundColor: '#10B981', color: '#020617', fontWeight: 800, borderRadius: '0.75rem' }}>
              RETAKE
            </Button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '90rem', margin: '0 auto', padding: '2rem 1.5rem', display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', position: 'relative', zIndex: 1 }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Performance Hero Dashboard */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
             <HeroCard label="Overall Score" value={`${overallScore}%`} icon={<Activity size={20} />} color="#10B981" progress={overallScore} />
             <HeroCard label="Words Per Min" value={wpm} icon={<Clock size={20} />} color="#6366F1" />
             <HeroCard label="Positivity" value={`${sentimentScore}%`} icon={<Smile size={20} />} color="#F59E0B" />
          </div>

          {/* Performance momentum chart (SVG) */}
          <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem' }}>
            <CardHeader style={{ padding: '1.5rem 2rem' }}>
              <CardTitle style={{ fontSize: '0.9rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Interview Performance Momentum</CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 2rem 2.5rem 2.5rem' }}>
              <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 1000 200" preserveAspectRatio="none">
                   <path 
                     d={`M 0,200 ${performanceTimeline.map((val, i) => `L ${(i / (performanceTimeline.length - 1)) * 1000},${200 - (val * 1.8)}`).join(' ')} L 1000,200 Z`}
                     fill="rgba(16, 185, 129, 0.1)"
                   />
                   <path 
                     d={performanceTimeline.map((val, i) => `${i === 0 ? 'M' : 'L'} ${(i / (performanceTimeline.length - 1)) * 1000},${200 - (val * 1.8)}`).join(' ')}
                     stroke="#10B981" strokeWidth="3" fill="none"
                   />
                </svg>
              </div>
            </CardContent>
          </Card>

          {/* Unified Report Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#020617', padding: '0.4rem', borderRadius: '1rem', border: '1px solid #1E293B' }}>
            <NavTab active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<TrendingUp size={16} />}>Analysis Summary</NavTab>
            {hasQuestions && <NavTab active={activeTab === 'questions'} onClick={() => setActiveTab('questions')} icon={<Target size={16} />}>Detailed Q&A</NavTab>}
            <NavTab active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} icon={<Type size={16} />}>Full Transcript</NavTab>
            {isCodingAnalysis && <NavTab active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Terminal size={16} />}>Code Analysis</NavTab>}
          </div>

          <div style={{ minHeight: '500px' }}>
            {activeTab === 'summary' && (
              <div style={{ animation: 'reveal 0.4s ease-out', display: 'grid', gap: '2rem' }}>
                <Card style={{ backgroundColor: 'rgba(30, 41, 59, 0.4)', border: '1px solid #1E293B', borderRadius: '1.5rem', backdropFilter: 'blur(8px)' }}>
                   <CardContent style={{ padding: '2rem' }}>
                      <p style={{ fontSize: '1.125rem', lineHeight: 1.8, color: '#E2E8F0', margin: 0 }}>{analysis.interviewSummary}</p>
                   </CardContent>
                </Card>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
                   {scoreItems.map((item, i) => (
                     <Card key={i} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.25rem' }}>
                        <CardContent style={{ padding: '1.25rem' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B' }}>{item.label}</span>
                              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: item.color }}>{item.value}%</span>
                           </div>
                           <div style={{ height: '5px', backgroundColor: '#1E293B', borderRadius: '100px', overflow: 'hidden' }}>
                              <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color }} />
                           </div>
                        </CardContent>
                     </Card>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'questions' && hasQuestions && (
              <div style={{ animation: 'reveal 0.4s ease-out', display: 'grid', gap: '1.5rem' }}>
                {analysis.questionByQuestionAnalysis.map((item, index) => (
                  <Card key={index} style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem' }}>
                    <CardHeader style={{ padding: '1.5rem 2rem' }}>
                       <CardTitle style={{ fontSize: '1.1rem', color: '#F8FAFC' }}>{item.question}</CardTitle>
                    </CardHeader>
                    <CardContent style={{ padding: '0 2rem 2rem 2rem' }}>
                       <div style={{ padding: '1.25rem', backgroundColor: '#020617', borderRadius: '1rem', borderLeft: '3px solid #10B981' }}>
                          <p style={{ margin: 0, color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.7 }}>{item.findings}</p>
                       </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Transcript Section - ONLY Transcript as requested */}
            {activeTab === 'transcript' && (
              <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem', animation: 'reveal 0.4s ease-out' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem' }}>
                    <FileText size={20} color="#6366F1" /> Performance Transcript
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ padding: '0 2rem 2.5rem 2rem' }}>
                   <div style={{ maxHeight: '700px', overflowY: 'auto', padding: '1.5rem', backgroundColor: '#020617', borderRadius: '1rem', border: '1px solid #1E293B' }}>
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: 2, color: '#E2E8F0', fontStyle: 'italic', fontSize: '1.05rem', margin: 0 }}>
                        {analysis.transcript || "No vocal input recorded."}
                      </p>
                   </div>
                </CardContent>
              </Card>
            )}

            {/* Code Analysis Section - Dedicated for code feedback */}
            {activeTab === 'code' && isCodingAnalysis && (
              <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem', animation: 'reveal 0.4s ease-out' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.15rem' }}>
                    <Terminal size={20} color="#10B981" /> Code Analysis
                  </CardTitle>
                  <CardDescription>Comprehensive review of coding logic, architecture, and efficiency.</CardDescription>
                </CardHeader>
                <CardContent style={{ display: 'grid', gap: '1.5rem', padding: '0 2rem 2.5rem 2rem' }}>
                   <CodeInsightBox title="Logic & Implementation" content={analysis.codingAnalysis?.correctnessDescription} />
                   <CodeInsightBox title="Performance & Complexity" content={analysis.codingAnalysis?.efficiency} />
                   <CodeInsightBox title="Maintainability & Styling" content={analysis.codingAnalysis?.styleAndReadability} />
                   <CodeInsightBox title="Alternative Architectures" content={analysis.codingAnalysis?.alternativeApproaches} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card style={{ backgroundColor: '#000', border: '1px solid #1E293B', borderRadius: '1.5rem', overflow: 'hidden' }}>
            <video src={videoUrl} controls style={{ width: '100%', aspectRatio: '16/9', display: 'block' }} />
          </Card>

          <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem' }}>
            <CardHeader style={{ padding: '1.25rem' }}>
              <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#10B981' }}>
                <Sparkles size={16} /> PRO GUIDANCE
              </CardTitle>
            </CardHeader>
            <CardContent style={{ padding: '0 1.25rem 1.25rem' }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem' }}>
                {(analysis.guidance || []).slice(0, 4).map((point, i) => (
                  <li key={i} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0, marginTop: '8px' }} />
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.5rem' }}>
             <CardHeader style={{ padding: '1.25rem' }}>
               <CardTitle style={{ fontSize: '0.85rem', color: '#64748B' }}>DYNAMICS SUMMARY</CardTitle>
             </CardHeader>
             <CardContent style={{ padding: '0 1rem 1rem' }}>
               <Accordion type="single" collapsible>
                 <DynamicsItem icon={<Mic size={14} />} title="Spoken Performance" data={analysis.vocalAnalysis} />
                 <DynamicsItem icon={<Video size={14} />} title="Visual Performance" data={analysis.videoAnalysis} />
               </Accordion>
             </CardContent>
          </Card>
        </div>
      </main>

      <style jsx global>{`
        @keyframes reveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #10B981; }
      `}</style>
    </div>
  );
}

// Helpers
function HeroCard({ label, value, icon, color, progress }) {
  return (
    <Card style={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', borderRadius: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '3px', height: '100%', backgroundColor: color }} />
      <CardContent style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#64748B', textTransform: 'uppercase' }}>{label}</span>
          <div style={{ color }}>{icon}</div>
        </div>
        <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#F8FAFC' }}>{value}</h3>
      </CardContent>
    </Card>
  );
}

function NavTab({ children, active, onClick, icon }) {
  return (
    <button 
      onClick={onClick}
      style={{ 
        flex: 1, padding: '0.6rem 0.75rem', fontSize: '0.75rem', fontWeight: 800, 
        color: active ? '#10B981' : '#64748B', backgroundColor: active ? '#0F172A' : 'transparent',
        borderRadius: '0.6rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s ease'
      }}
    >
      {icon} {children}
    </button>
  );
}

function CodeInsightBox({ title, content }) {
  if (!content) return null;
  return (
    <div style={{ padding: '1.25rem', borderRadius: '1rem', backgroundColor: '#020617', border: '1px solid #1E293B' }}>
      <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#10B981', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{title}</h4>
      <p style={{ margin: 0, color: '#CBD5E1', fontSize: '1rem', lineHeight: 1.6 }}>{content}</p>
    </div>
  );
}

function DynamicsItem({ icon, title, data }) {
  if (!data) return null;
  return (
    <AccordionItem value={title} style={{ border: 'none' }}>
      <AccordionTrigger style={{ padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'transparent', color: '#F8FAFC', fontSize: '0.8rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{icon} {title}</div>
      </AccordionTrigger>
      <AccordionContent style={{ padding: '1rem', color: '#94A3B8', fontSize: '0.8rem' }}>
         {Object.entries(data).map(([k, v]) => (
           <div key={k} style={{ marginBottom: '4px' }}>
             <span style={{ fontWeight: 700, color: '#475569', textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}: </span>
             <span>{v}</span>
           </div>
         ))}
      </AccordionContent>
    </AccordionItem>
  );
}