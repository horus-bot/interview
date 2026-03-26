'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  TrendingUp,
  Camera,
  Mic,
  Code,
  FileText,
  Sparkles,
  Target,
  Activity
} from 'lucide-react';
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function AnalysisDashboard({ videoUrl, analysis: initialAnalysis }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');

  if (!initialAnalysis) return null;

  const analysis = initialAnalysis;
  const scoreBreakdown = analysis.scoreBreakdown || {};
  const audioAnalysis = analysis.audioAnalysis || {};
  const visualSnapshots = Array.isArray(analysis.visualSnapshots) ? analysis.visualSnapshots : [];
  const codeSubmissions = Array.isArray(analysis.codeSubmissions) ? analysis.codeSubmissions : [];
  const transcript = analysis.transcript || '';

  const overallScore = Math.max(0, Math.min(100, Number(analysis.score ?? 0)));

  const scoreCards = [
    { label: 'Code Quality', value: Number(scoreBreakdown.codeQuality || 0), color: '#38BDF8' },
    { label: 'Problem Solving', value: Number(scoreBreakdown.problemSolving || 0), color: '#22C55E' },
    { label: 'Visual Confidence', value: Number(scoreBreakdown.visualConfidence || 0), color: '#F59E0B' },
    { label: 'Grammar', value: Number(scoreBreakdown.grammar || 0), color: '#A78BFA' },
    { label: 'Fluency', value: Number(scoreBreakdown.fluency || 0), color: '#F97316' }
  ];

  const radarData = scoreCards.map((item) => ({ metric: item.label, score: item.value }));

  const questionChartData = useMemo(() => {
    const items = Array.isArray(analysis.questionByQuestionAnalysis) ? analysis.questionByQuestionAnalysis : [];
    if (!items.length) {
      return [{ question: 'Q1', score: overallScore }];
    }

    return items.map((item, index) => ({
      question: `Q${index + 1}`,
      score: Number(item.score || 0)
    }));
  }, [analysis.questionByQuestionAnalysis, overallScore]);

  const audioMetricData = [
    { metric: 'Communication', score: Number(audioAnalysis.communicationScore || 0) },
    { metric: 'Clarity', score: Number(audioAnalysis.clarityScore || 0) },
    { metric: 'Tech Vocabulary', score: Number(audioAnalysis.technicalVocabularyScore || 0) }
  ];

  const handlePrint = () => window.print();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#030711', color: '#E2E8F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid #1F2937', backgroundColor: 'rgba(3, 7, 17, 0.85)', backdropFilter: 'blur(10px)' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0.9rem 1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button variant="ghost" size="icon" onClick={() => router.push('/my-analyses')} style={{ color: '#CBD5E1' }}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Coding Interview Analysis Report</h1>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94A3B8' }}>Detailed AI summary with visual, audio, and code diagnostics</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Button variant="outline" onClick={handlePrint} style={{ borderColor: '#334155', backgroundColor: 'transparent', color: '#F8FAFC' }}>
              <Download size={16} />
            </Button>
            <Button onClick={() => router.push('/interview/coding')} style={{ backgroundColor: '#22C55E', color: '#052E16', fontWeight: 700 }}>
              Retake
            </Button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '1.2rem' }}>
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.8rem' }}>
            <MetricCard icon={<Activity size={16} />} label="Overall" value={`${overallScore}%`} color="#22C55E" />
            <MetricCard icon={<Camera size={16} />} label="Visual Snapshots" value={String(visualSnapshots.length)} color="#F59E0B" />
            <MetricCard icon={<Mic size={16} />} label="Transcript Length" value={`${transcript.trim().split(/\s+/).filter(Boolean).length} words`} color="#A78BFA" />
            <MetricCard icon={<Code size={16} />} label="Code Answers" value={String(codeSubmissions.length)} color="#38BDF8" />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#020617', padding: '0.35rem', borderRadius: '0.85rem', border: '1px solid #1E293B', flexWrap: 'wrap' }}>
            <TabButton active={activeTab === 'summary'} onClick={() => setActiveTab('summary')} icon={<TrendingUp size={14} />} text="Analysis Summary" />
            <TabButton active={activeTab === 'visual'} onClick={() => setActiveTab('visual')} icon={<Camera size={14} />} text="Visual Analysis" />
            <TabButton active={activeTab === 'audio'} onClick={() => setActiveTab('audio')} icon={<Mic size={14} />} text="Audio Analysis" />
            <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon={<Code size={14} />} text="Code" />
            <TabButton active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} icon={<FileText size={14} />} text="Full Transcript" />
          </div>

          {activeTab === 'summary' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Sparkles size={16} color="#22C55E" /> AI Summary</CardTitle>
                  <CardDescription>{analysis.interviewSummary || analysis.transcript || 'AI summary not available.'}</CardDescription>
                </CardHeader>
              </Card>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '0.95rem' }}>Score Radar</CardTitle>
                    <CardDescription>Template chart filled from AI score breakdown</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 10 }} />
                        <Radar dataKey="score" stroke="#22C55E" fill="#22C55E" fillOpacity={0.25} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                  <CardHeader>
                    <CardTitle style={{ fontSize: '0.95rem' }}>Question Scores</CardTitle>
                    <CardDescription>Per-question curve from analysis response</CardDescription>
                  </CardHeader>
                  <CardContent style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={questionChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="question" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="score" stroke="#38BDF8" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
                {scoreCards.map((item) => (
                  <Card key={item.label} style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                    <CardContent style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{item.label}</span>
                        <strong style={{ color: item.color }}>{item.value}%</strong>
                      </div>
                      <div style={{ height: '6px', backgroundColor: '#1E293B', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.value}%`, height: '100%', backgroundColor: item.color }} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Camera size={17} color="#F59E0B" /> Visual Analysis</CardTitle>
                <CardDescription>Frames captured in background during interview and analyzed by local frame API</CardDescription>
              </CardHeader>
              <CardContent style={{ display: 'grid', gap: '0.9rem' }}>
                {!visualSnapshots.length && <p style={{ margin: 0, color: '#94A3B8' }}>No visual snapshots were captured.</p>}
                {visualSnapshots.map((snapshot, index) => (
                  <div key={snapshot.id || index} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: '0.9rem', padding: '0.8rem', border: '1px solid #243244', borderRadius: '0.9rem', backgroundColor: '#020617' }}>
                    <img src={snapshot.frameDataUri} alt={`Snapshot ${index + 1}`} style={{ width: '100%', borderRadius: '0.6rem', border: '1px solid #334155', objectFit: 'cover', aspectRatio: '16/9' }} />
                    <div>
                      <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.82rem', color: '#94A3B8' }}>
                        Trigger: <strong style={{ color: '#E2E8F0' }}>{snapshot.trigger}</strong> | Question {Number(snapshot.questionIndex || 0) + 1}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.55, color: '#CBD5E1' }}>
                        {snapshot.analysis || snapshot.error || 'Analysis pending...'}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === 'audio' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Mic size={17} color="#A78BFA" /> Audio Analysis</CardTitle>
                  <CardDescription>{audioAnalysis.summary || 'Transcript-focused Groq analysis.'}</CardDescription>
                </CardHeader>
                <CardContent style={{ height: '260px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={audioMetricData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                      <XAxis dataKey="metric" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: '#94A3B8', fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="score" fill="#A78BFA" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: '1rem' }}>Strengths and Improvements</CardTitle>
                </CardHeader>
                <CardContent style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                  <ListBlock title="Strengths" items={audioAnalysis.strengths} accent="#22C55E" />
                  <ListBlock title="Improvements" items={audioAnalysis.improvements} accent="#F97316" />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'code' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Code size={17} color="#38BDF8" /> Code Analysis</CardTitle>
                  <CardDescription>Submitted answers with AI code feedback</CardDescription>
                </CardHeader>
                <CardContent style={{ display: 'grid', gap: '1rem' }}>
                  {!codeSubmissions.length && <p style={{ margin: 0, color: '#94A3B8' }}>No code submission found.</p>}
                  {codeSubmissions.map((submission, index) => (
                    <div key={`${submission.question}-${index}`} style={{ border: '1px solid #243244', borderRadius: '0.9rem', overflow: 'hidden' }}>
                      <div style={{ padding: '0.75rem 0.9rem', backgroundColor: '#020617', borderBottom: '1px solid #243244' }}>
                        <strong style={{ fontSize: '0.88rem' }}>Question {index + 1}</strong>
                        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.83rem', color: '#94A3B8' }}>{submission.question}</p>
                      </div>
                      <pre style={{ margin: 0, padding: '0.9rem', backgroundColor: '#020617', color: '#CBD5E1', overflowX: 'auto', fontSize: '0.8rem', lineHeight: 1.6, fontFamily: 'Consolas, Monaco, monospace' }}>
{submission.code || '// No code provided'}
                      </pre>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
                <CardHeader>
                  <CardTitle style={{ fontSize: '1rem' }}>AI Code Feedback</CardTitle>
                </CardHeader>
                <CardContent style={{ display: 'grid', gap: '0.8rem' }}>
                  <FeedbackBox title="Code Quality" value={analysis.feedback?.codeQuality} />
                  <FeedbackBox title="Problem Solving" value={analysis.feedback?.problemSolving} />
                  <FeedbackBox title="Communication" value={analysis.feedback?.communication} />
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'transcript' && (
            <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
              <CardHeader>
                <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText size={17} color="#94A3B8" /> Full Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div style={{ border: '1px solid #1E293B', borderRadius: '0.8rem', backgroundColor: '#020617', padding: '1rem', maxHeight: '560px', overflowY: 'auto' }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.75, color: '#CBD5E1' }}>
                    {transcript || 'No transcript captured.'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card style={{ backgroundColor: '#000', border: '1px solid #1E293B', overflow: 'hidden' }}>
            <video src={videoUrl} controls style={{ width: '100%', display: 'block', aspectRatio: '16/9' }} />
          </Card>

          <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
            <CardHeader>
              <CardTitle style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} color="#22C55E" /> Guidance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul style={{ margin: 0, paddingLeft: '1rem', color: '#CBD5E1', lineHeight: 1.6 }}>
                {(analysis.guidance || []).slice(0, 6).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
                {!analysis.guidance?.length && <li>Guidance data was not generated in this run.</li>}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}

function MetricCard({ icon, label, value, color }) {
  return (
    <Card style={{ backgroundColor: '#0B1220', border: '1px solid #1E293B' }}>
      <CardContent style={{ padding: '0.9rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>{label}</span>
          <span style={{ color }}>{icon}</span>
        </div>
        <div style={{ marginTop: '0.4rem', fontSize: '1.2rem', fontWeight: 800 }}>{value}</div>
      </CardContent>
    </Card>
  );
}

function TabButton({ active, onClick, icon, text }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: 'none',
        borderRadius: '0.6rem',
        padding: '0.55rem 0.7rem',
        backgroundColor: active ? '#0B1220' : 'transparent',
        color: active ? '#E2E8F0' : '#64748B',
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        fontWeight: 700,
        fontSize: '0.78rem',
        cursor: 'pointer'
      }}>
      {icon}
      {text}
    </button>
  );
}

function ListBlock({ title, items, accent }) {
  const safeItems = Array.isArray(items) && items.length ? items : ['No data available.'];
  return (
    <div style={{ border: '1px solid #1E293B', borderRadius: '0.8rem', backgroundColor: '#020617', padding: '0.8rem' }}>
      <h4 style={{ margin: '0 0 0.5rem 0', color: accent, fontSize: '0.84rem', textTransform: 'uppercase' }}>{title}</h4>
      <ul style={{ margin: 0, paddingLeft: '1rem', color: '#CBD5E1', fontSize: '0.88rem', lineHeight: 1.5 }}>
        {safeItems.map((item, index) => <li key={`${title}-${index}`}>{item}</li>)}
      </ul>
    </div>
  );
}

function FeedbackBox({ title, value }) {
  return (
    <div style={{ border: '1px solid #1E293B', borderRadius: '0.8rem', backgroundColor: '#020617', padding: '0.8rem' }}>
      <h4 style={{ margin: '0 0 0.35rem 0', fontSize: '0.84rem', color: '#38BDF8', textTransform: 'uppercase' }}>{title}</h4>
      <p style={{ margin: 0, color: '#CBD5E1', lineHeight: 1.6 }}>{value || 'No detailed feedback available.'}</p>
    </div>
  );
}
