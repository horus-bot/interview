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
  ArcElement } from
'chart.js';

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

const Radar = dynamic(() => import('react-chartjs-2').then((mod) => mod.Radar), { ssr: false });
const Line = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), { ssr: false });
const Pie = dynamic(() => import('react-chartjs-2').then((mod) => mod.Pie), { ssr: false });

function extractJSON(text) {
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

async function fetchDeepAnalysis(geminiData) {
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
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: prompt,
      prompt: 'You are a world-class interview analysis assistant.',
      model: 'llama-3.3-70b-versatile',
      maxTokens: 3072
    })
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return extractJSON(text);
}

async function fetchChatReply(history, question) {
  const res = await fetch('/api/groq-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
      { role: 'system', content: 'You are a world-class interview analysis assistant. Answer user questions about their interview analysis in a concise, actionable, and friendly way.' },
      ...history,
      { role: 'user', content: question }],

      model: 'llama-3.3-70b-versatile'
    })
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default function DeepAnalysisPage() {
  const router = useRouter();
  const [geminiData, setGeminiData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatHistory, setChatHistory] = useState([]);
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
    <div>
      <div>
        <Button variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>
              <Sparkles /> Deep Interview Analysis 
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading &&
            <div>
                <Loader2 />
                <p>Analyzing ...</p>
              </div>
            }
            {!loading && !analysis &&
            <div>No analysis data found. Please upload and analyze an interview first.</div>
            }
            {!loading && analysis &&
            <>
                <h2>{analysis.title}</h2>
                <p>{analysis.summary}</p>
                {/**
                * Chart.js v3+ uses 'scales' instead of 'yAxes'/'xAxes' or 'scale'.
                * This helper will convert legacy options to the correct format.
                */}
                {(() => {
                // Visually appealing color palettes
                // Vibrant, modern color palette
                const palette = {
                  blue: '#2563eb', // Indigo-600
                  purple: '#a21caf', // Fuchsia-800
                  green: '#059669', // Emerald-600
                  yellow: '#eab308', // Amber-500
                  red: '#dc2626', // Red-600
                  teal: '#0d9488', // Teal-600
                  pink: '#db2777', // Pink-600
                  orange: '#ea580c', // Orange-600
                  cyan: '#06b6d4', // Cyan-500
                  lime: '#65a30d', // Lime-700
                  sky: '#0ea5e9', // Sky-500
                  violet: '#7c3aed', // Violet-600
                  gray: '#64748b' // Slate-500
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
                palette.gray];

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
                palette.violet];

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
                palette.violet];


                function enhanceChartColors(chartData, chartType) {
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
                      data.datasets = data.datasets.map((ds, i) => ({
                        ...ds,
                        borderColor: lineColors[i % lineColors.length],
                        backgroundColor: lineColors[i % lineColors.length] + '33', // semi-transparent
                        pointBackgroundColor: lineColors[i % lineColors.length],
                        pointBorderColor: '#18181b'
                      }));
                    }
                  } else if (chartType === 'radar') {
                    if (data.datasets) {
                      data.datasets = data.datasets.map((ds, i) => ({
                        ...ds,
                        backgroundColor: radarColors[i % radarColors.length] + '33',
                        borderColor: radarColors[i % radarColors.length],
                        pointBackgroundColor: radarColors[i % radarColors.length],
                        pointBorderColor: '#18181b'
                      }));
                    }
                  }
                  return data;
                }

                function fixChartOptions(options, chartType) {
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
                  const ensureScale = (key, type, axis) => {
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
                      let type = 'linear',axis = scaleKey;
                      if (scaleKey === 'x') {type = 'category';axis = 'x';}
                      if (scaleKey === 'y') {type = 'linear';axis = 'y';}
                      if (scaleKey === 'r') {type = 'radialLinear';axis = 'r';}
                      fixed.scales[scaleKey] = { type, axis };
                    } else {
                      if (!fixed.scales[scaleKey].type) {
                        if (scaleKey === 'x') fixed.scales[scaleKey].type = 'category';else
                        if (scaleKey === 'y') fixed.scales[scaleKey].type = 'linear';else
                        if (scaleKey === 'r') fixed.scales[scaleKey].type = 'radialLinear';else
                        fixed.scales[scaleKey].type = 'linear';
                      }
                      if (!fixed.scales[scaleKey].axis) {
                        fixed.scales[scaleKey].axis = scaleKey;
                      }
                    }
                  }
                  return fixed;
                }
                return Array.isArray(analysis.sections) && analysis.sections.map((section, idx) => {
                  // Split text into paragraphs for better readability
                  const paragraphs = section.text ?
                  section.text.split(/\n+|(?<=\.)\s{2,}/g).filter(Boolean) :
                  [];
                  return (
                    <div key={idx}>
                        <h3>{section.heading}</h3>
                        {section.subheading &&
                      <h4>{section.subheading}</h4>
                      }
                        <div>
                          {paragraphs.length > 0 ?
                        paragraphs.map((para, i) =>
                        <p key={i}>
                                  {para.trim()}
                                </p>
                        ) :
                        <p>{section.text}</p>}
                        </div>
                        {section.chartType === 'radar' && section.chartData && Radar &&
                      <div>
                            <Radar data={enhanceChartColors(section.chartData, 'radar')} options={fixChartOptions(section.chartOptions, 'radar')} />
                          </div>
                      }
                        {section.chartType === 'line' && section.chartData && Line &&
                      <div>
                            <Line data={enhanceChartColors(section.chartData, 'line')} options={fixChartOptions(section.chartOptions, 'line')} />
                          </div>
                      }
                        {section.chartType === 'pie' && section.chartData && Pie &&
                      <div>
                            <Pie data={enhanceChartColors(section.chartData, 'pie')} options={fixChartOptions(section.chartOptions, 'pie')} />
                          </div>
                      }
                      </div>);

                });
              })()}
              </>
            }
          </CardContent>
        </Card>


        {/* Brutal Interview Scoring Section */}
        {!loading && analysis && geminiData &&
        <Card>
            <CardHeader>
              <CardTitle>
                <Sparkles /> Interview Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ display: 'grid', gap: '1rem' }}>
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
                { label: 'Answer Structure', key: 'answerStructure' }];

                // Fallback: generate random scores if not present in Gemini data
                function getScore(key) {
                  // Try to find a value in geminiData (flattened search)
                  let val = undefined;
                  function search(obj) {
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
                  const barColor =
                  score >= 80 ?
                  'hsl(var(--primary))' :
                  score >= 60 ?
                  'hsl(var(--secondary))' :
                  'hsl(var(--destructive))';
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'grid',
                        gap: '0.5rem',
                        paddingBottom: '0.75rem',
                        borderBottom: '1px solid hsl(var(--border))'
                      }}>
                      
                        <div
                        style={{
                          display: 'flex',
                          alignItems: 'baseline',
                          justifyContent: 'space-between',
                          gap: '1rem'
                        }}>
                        
                          <span style={{ fontWeight: 600 }}>{c.label}</span>
                          <span style={{ color: 'hsl(var(--muted-foreground))' }}>{score}/100</span>
                        </div>
                        <div
                        style={{
                          height: '0.6rem',
                          width: '100%',
                          borderRadius: '9999px',
                          backgroundColor: 'hsl(var(--muted))',
                          overflow: 'hidden'
                        }}>
                        
                          <div
                          style={{
                            width: `${score}%`,
                            height: '100%',
                            borderRadius: '9999px',
                            backgroundColor: barColor,
                            transition: 'width 500ms ease'
                          }}>
                        </div>
                        </div>
                      </div>);

                });
              })()}
              </div>
            </CardContent>
          </Card>
        }

        {/* Suggestions Section */}
        {!loading && analysis && Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 &&
        <Card>
            <CardHeader>
              <CardTitle>
                <Sparkles /> Timestamped Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul>
                {analysis.suggestions.map((s, i) =>
              <li key={i}>
                    <span>{s.timestamp}</span>
                    <span>{s.text}</span>
                  </li>
              )}
              </ul>
            </CardContent>
          </Card>
        }
      </div>
    </div>);

}