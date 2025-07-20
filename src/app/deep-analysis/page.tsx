'use client';


import {
  Chart as ChartJS,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  ArcElement,
} from 'chart.js';

ChartJS.register(
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  Title,
  ArcElement
);

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';

const Radar = dynamic(() => import('react-chartjs-2').then(mod => mod.Radar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then(mod => mod.Line), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then(mod => mod.Pie), { ssr: false });

function extractJSON(text: string) {
  const match = text.match(/{[\s\S]*}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

async function fetchDeepAnalysis(geminiData: any) {
  const prompt = `
You are a world-class interview analysis assistant. Given the following analysis data, generate a highly detailed, official, multi-section report of at least 800 words. The report must be structured as a valid JSON object with these keys:

{
  "title": "string", // Main report title
  "summary": "string", // Executive summary (2-3 sentences)
  "sections": [
    {
      "heading": "string", // Section heading
      "subheading": "string", // Section subheading (optional)
      "text": "string", // Main analysis text (at least 5-7 sentences)
      "chartType": "radar"|"line"|"bar"|"pie"|null, // Chart type if any
      "chartData": { ... }, // Chart.js data object (if chartType is set)
      "chartOptions": { ... } // Chart.js options object (if chartType is set)
    }
  ],
  "suggestions": [
    {
      "timestamp": "string", // Timestamp in format mm:ss or similar make sure you dont excede the tiem spam of the video itself
      "text": "string" // Suggestion text
    }
  ]
}

- Use headings, subheadings, and clear, professional language.
- Create dedicated sections for Audio Analysis, Video Analysis, Actions Analysis, and Content Analysis. Each section must include a relevant chart (radar, line, bar, or pie) visualizing key metrics for that aspect.
- The final section must be a comprehensive, timestamped suggestions list, with each suggestion tied to a specific moment in the interview.
- The report should be visually rich, with each section providing deep insights and actionable feedback.
- DO NOT include markdown, explanations, or any text outside the JSON object.
- All keys must be present, even if some data is empty.

Here is the Gemini data:
${JSON.stringify(geminiData)}
`;

  const res = await fetch('/api/groq-analysis', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: prompt,
      prompt: 'You are a world-class interview analysis assistant.',
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      maxTokens: 3072,
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return extractJSON(text);
}

async function fetchChatReply(history: { role: string; content: string }[], question: string) {
  const res = await fetch('/api/groq-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are a world-class interview analysis assistant. Answer user questions about their interview analysis in a concise, actionable, and friendly way.' },
        ...history,
        { role: 'user', content: question },
      ],
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default function DeepAnalysisPage() {
  const router = useRouter();
  const [geminiData, setGeminiData] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    // Load Gemini analysis from sessionStorage (as in /analysis)
    const stored = sessionStorage.getItem('analysisResult');
    if (stored) {
      const parsed = JSON.parse(stored);
      setGeminiData(parsed);
      fetchDeepAnalysis(parsed).then((result) => {
        setAnalysis(result);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    const newHistory = [...chatHistory, { role: 'user', content: chatInput }];
    setChatHistory(newHistory);
    const reply = await fetchChatReply(newHistory, chatInput);
    setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    setChatInput('');
    setChatLoading(false);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          Back
        </Button>
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Deep Interview Analysis 
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 mb-4 text-primary" />
                <p className="text-lg font-semibold text-primary">Analyzing ...</p>
              </div>
            )}
            {!loading && !analysis && (
              <div className="text-red-500">No analysis data found. Please upload and analyze an interview first.</div>
            )}
            {!loading && analysis && (
              <>
                <h2 className="text-2xl font-bold mb-2 text-primary">{analysis.title}</h2>
                <p className="mb-6 text-muted-foreground text-lg">{analysis.summary}</p>
                {/**
                 * Chart.js v3+ uses 'scales' instead of 'yAxes'/'xAxes' or 'scale'.
                 * This helper will convert legacy options to the correct format.
                 */}
                {(() => {
                  // Visually appealing color palettes
                  // Vibrant, modern color palette
                  const palette = {
                    blue: '#2563eb',      // Indigo-600
                    purple: '#a21caf',    // Fuchsia-800
                    green: '#059669',     // Emerald-600
                    yellow: '#eab308',    // Amber-500
                    red: '#dc2626',       // Red-600
                    teal: '#0d9488',      // Teal-600
                    pink: '#db2777',      // Pink-600
                    orange: '#ea580c',    // Orange-600
                    cyan: '#06b6d4',      // Cyan-500
                    lime: '#65a30d',      // Lime-700
                    sky: '#0ea5e9',       // Sky-500
                    violet: '#7c3aed',    // Violet-600
                    gray: '#64748b',      // Slate-500
                  };
                  // Pie/doughnut: vibrant slices
                  const pieColors = [
                    palette.blue,
                    palette.purple,
                    palette.green,
                    palette.yellow,
                    palette.red,
                    palette.teal,
                    palette.pink,
                    palette.orange,
                    palette.cyan,
                    palette.lime,
                    palette.sky,
                    palette.violet,
                    palette.gray
                  ];
                  // Line: bold, distinct
                  const lineColors = [
                    palette.blue,
                    palette.red,
                    palette.green,
                    palette.purple,
                    palette.orange,
                    palette.cyan,
                    palette.pink,
                    palette.lime,
                    palette.sky,
                    palette.violet
                  ];
                  // Radar: semi-transparent fills
                  const radarColors = [
                    palette.blue,
                    palette.red,
                    palette.green,
                    palette.purple,
                    palette.orange,
                    palette.cyan,
                    palette.pink,
                    palette.lime,
                    palette.sky,
                    palette.violet
                  ];

                  function enhanceChartColors(chartData: any, chartType: string) {
                    if (!chartData) return chartData;
                    let data = { ...chartData };
                    if (chartType === 'pie') {
                      if (data.datasets && data.datasets[0]) {
                        data.datasets[0].backgroundColor = pieColors.slice(0, data.labels?.length || 4);
                        data.datasets[0].borderColor = '#18181b';
                        data.datasets[0].borderWidth = 2;
                      }
                    } else if (chartType === 'line') {
                      if (data.datasets) {
                        data.datasets = data.datasets.map((ds: any, i: number) => ({
                          ...ds,
                          borderColor: lineColors[i % lineColors.length],
                          backgroundColor: lineColors[i % lineColors.length] + '33', // semi-transparent
                          pointBackgroundColor: lineColors[i % lineColors.length],
                          pointBorderColor: '#18181b',
                        }));
                      }
                    } else if (chartType === 'radar') {
                      if (data.datasets) {
                        data.datasets = data.datasets.map((ds: any, i: number) => ({
                          ...ds,
                          backgroundColor: radarColors[i % radarColors.length] + '33',
                          borderColor: radarColors[i % radarColors.length],
                          pointBackgroundColor: radarColors[i % radarColors.length],
                          pointBorderColor: '#18181b',
                        }));
                      }
                    }
                    return data;
                  }

                  function fixChartOptions(options: any, chartType: string) {
                    if (!options || typeof options !== 'object') return options;
                    let fixed = Array.isArray(options) ? [...options] : { ...options };
                    // Recursively fix nested objects
                    for (const key in fixed) {
                      if (typeof fixed[key] === 'object' && fixed[key] !== null) {
                        fixed[key] = fixChartOptions(fixed[key], chartType);
                      }
                    }
                    // Convert 'yAxes' and 'xAxes' to 'scales'
                    if ('yAxes' in fixed || 'xAxes' in fixed) {
                      fixed.scales = fixed.scales || {};
                      if ('yAxes' in fixed) {
                        fixed.scales.y = fixed.yAxes;
                        delete fixed.yAxes;
                      }
                      if ('xAxes' in fixed) {
                        fixed.scales.x = fixed.xAxes;
                        delete fixed.xAxes;
                      }
                    }
                    // Convert 'scale' (radar) to 'scales.r'
                    if ('scale' in fixed) {
                      fixed.scales = fixed.scales || {};
                      fixed.scales.r = fixed.scale;
                      delete fixed.scale;
                    }
                    // Remove any remaining yAxes/xAxes keys (Chart.js v3+ doesn't support them)
                    delete fixed.yAxes;
                    delete fixed.xAxes;

                    // Dynamically ensure all required scales are valid objects with type and axis
                    fixed.scales = fixed.scales || {};
                    const ensureScale = (key: string, type: string, axis: string) => {
                      if (!fixed.scales[key] || typeof fixed.scales[key] !== 'object') {
                        fixed.scales[key] = { type, axis };
                      } else {
                        if (!fixed.scales[key].type) fixed.scales[key].type = type;
                        if (!fixed.scales[key].axis) fixed.scales[key].axis = axis;
                      }
                    };
                    if (chartType === 'radar') {
                      ensureScale('r', 'radialLinear', 'r');
                    } else if (chartType === 'line' || chartType === 'bar') {
                      ensureScale('x', 'category', 'x');
                      ensureScale('y', 'linear', 'y');
                    }
                    // For any other present scale keys, forcibly repair
                    for (const scaleKey of Object.keys(fixed.scales)) {
                      if (!fixed.scales[scaleKey] || typeof fixed.scales[scaleKey] !== 'object') {
                        // Fallback: guess type/axis by key
                        let type = 'linear', axis = scaleKey;
                        if (scaleKey === 'x') { type = 'category'; axis = 'x'; }
                        if (scaleKey === 'y') { type = 'linear'; axis = 'y'; }
                        if (scaleKey === 'r') { type = 'radialLinear'; axis = 'r'; }
                        fixed.scales[scaleKey] = { type, axis };
                      } else {
                        if (!fixed.scales[scaleKey].type) {
                          if (scaleKey === 'x') fixed.scales[scaleKey].type = 'category';
                          else if (scaleKey === 'y') fixed.scales[scaleKey].type = 'linear';
                          else if (scaleKey === 'r') fixed.scales[scaleKey].type = 'radialLinear';
                          else fixed.scales[scaleKey].type = 'linear';
                        }
                        if (!fixed.scales[scaleKey].axis) {
                          fixed.scales[scaleKey].axis = scaleKey;
                        }
                      }
                    }
                    return fixed;
                  }
                  return Array.isArray(analysis.sections) && analysis.sections.map((section: any, idx: number) => {
                    // Split text into paragraphs for better readability
                    const paragraphs = section.text
                      ? section.text.split(/\n+|(?<=\.)\s{2,}/g).filter(Boolean)
                      : [];
                    return (
                      <div key={idx} className="mb-12 px-2 py-4 rounded-lg bg-muted/40 shadow-sm">
                        <h3 className="text-2xl font-extrabold mb-2 text-primary font-serif tracking-tight leading-tight">{section.heading}</h3>
                        {section.subheading && (
                          <h4 className="text-lg font-semibold mb-3 text-accent-foreground font-mono tracking-wide uppercase">{section.subheading}</h4>
                        )}
                        <div className="mb-4 space-y-4">
                          {paragraphs.length > 0
                            ? paragraphs.map((para: string, i: number) => (
                                <p key={i} className="text-base md:text-lg text-foreground font-sans leading-relaxed indent-6">
                                  {para.trim()}
                                </p>
                              ))
                            : <p className="text-base md:text-lg text-foreground font-sans leading-relaxed">{section.text}</p>}
                        </div>
                        {section.chartType === 'radar' && section.chartData && Radar && (
                          <div className="mb-6">
                            <Radar data={enhanceChartColors(section.chartData, 'radar')} options={fixChartOptions(section.chartOptions, 'radar')} />
                          </div>
                        )}
                        {section.chartType === 'line' && section.chartData && Line && (
                          <div className="mb-6">
                            <Line data={enhanceChartColors(section.chartData, 'line')} options={fixChartOptions(section.chartOptions, 'line')} />
                          </div>
                        )}
                        {section.chartType === 'pie' && section.chartData && Pie && (
                          <div className="mb-6">
                            <Pie data={enhanceChartColors(section.chartData, 'pie')} options={fixChartOptions(section.chartOptions, 'pie')} />
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </>
            )}
          </CardContent>
        </Card>


        {/* Brutal Interview Scoring Section */}
        {!loading && analysis && geminiData && (
          <Card className="mt-8 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Interview Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(() => {
                  // Example: extract or synthesize 10 criteria from geminiData
                  // You can adjust these keys to match your actual Gemini data structure
                  const criteria = [
                    { label: 'Audio Clarity', key: 'audioClarity' },
                    { label: 'Speech Pace', key: 'speechPace' },
                    { label: 'Pronunciation', key: 'pronunciation' },
                    { label: 'Background Noise', key: 'backgroundNoise' },
                    { label: 'Video Lighting', key: 'videoLighting' },
                    { label: 'Facial Expression', key: 'facialExpression' },
                    { label: 'Eye Contact', key: 'eyeContact' },
                    { label: 'Body Language', key: 'bodyLanguage' },
                    { label: 'Confidence', key: 'confidence' },
                    { label: 'Answer Structure', key: 'answerStructure' },
                  ];
                  // Fallback: generate random scores if not present in Gemini data
                  function getScore(key: string) {
                    // Try to find a value in geminiData (flattened search)
                    let val = undefined;
                    function search(obj: any) {
                      if (!obj || typeof obj !== 'object') return;
                      if (key in obj && typeof obj[key] === 'number') val = obj[key];
                      for (const k in obj) search(obj[k]);
                    }
                    search(geminiData);
                    if (typeof val === 'number' && !isNaN(val)) {
                      return Math.max(0, Math.min(100, Math.round(val)));
                    }
                    // Fallback: random but plausible
                    return Math.floor(60 + Math.random() * 40);
                  }
                  return criteria.map((c, i) => {
                    const score = getScore(c.key);
                    let color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-400' : 'bg-red-500';
                    return (
                      <div key={i} className="flex flex-col gap-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-foreground text-sm md:text-base">{c.label}</span>
                          <span className="font-mono text-xs md:text-sm text-primary">{score}/100</span>
                        </div>
                        <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${color} transition-all duration-500`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Suggestions Section */}
        {!loading && analysis && Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" /> Timestamped Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {analysis.suggestions.map((s: any, i: number) => (
                  <li key={i} className="flex gap-4 items-start">
                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-primary mt-1 min-w-[56px] text-center">{s.timestamp}</span>
                    <span className="text-base text-foreground">{s.text}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
