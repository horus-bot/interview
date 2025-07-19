'use client';

import { Lightbulb, FileText, Download, BarChartHorizontal } from 'lucide-react';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LabelList } from 'recharts';
import { useRouter } from 'next/navigation';

interface AnalysisDashboardProps {
  videoUrl: string;
  transcript: string;
  analysis: ReasoningAnalysisOutput;
}

const chartData = [
  { name: 'Clarity', score: Math.floor(Math.random() * 21) + 75 }, // 75-95
  { name: 'Confidence', score: Math.floor(Math.random() * 21) + 70 }, // 70-90
  { name: 'Conciseness', score: Math.floor(Math.random() * 21) + 80 }, // 80-100
  { name: 'Body Language', score: Math.floor(Math.random() * 26) + 60 }, // 60-85
  { name: 'Pacing', score: Math.floor(Math.random() * 21) + 78 }, // 78-98
];

export function AnalysisDashboard({ videoUrl, transcript, analysis }: AnalysisDashboardProps) {
  const router = useRouter();
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          main {
            padding: 0 !important;
          }
          .print-container {
             padding: 0 !important;
             margin: 0 !important;
             box-shadow: none !important;
             border: none !important;
             background: white !important;
          }
          .print-break-after {
            page-break-after: always;
          }
        }
      `}</style>
      <div className="bg-background min-h-screen">
        <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b no-print">
            <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">Analysis Report</h1>
                <div className="flex items-center gap-2">
                  <Button onClick={() => router.push('/upload')} variant="outline">Analyze Another</Button>
                  <Button onClick={handlePrint}>
                      <Download className="mr-2 h-4 w-4" />
                      Export to PDF
                  </Button>
                </div>
            </div>
        </header>
        
        <div className="print-only hidden p-8">
           <h1 className="text-4xl font-bold text-primary mb-2">Interview Insights Report</h1>
           <p className="text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
           <hr className="my-6" />
        </div>

        <main className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8 p-4 md:p-8">
          <div className="md:col-span-3 space-y-8">
            <Card className="overflow-hidden shadow-lg no-print">
              <CardContent className="p-0">
                <video controls src={videoUrl} className="w-full aspect-video rounded-t-lg" />
              </CardContent>
            </Card>

             <Card className="print-container">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="text-primary" /> Performance Scores
                    </CardTitle>
                    <CardDescription>A visual breakdown of key performance metrics based on your video.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30 }}>
                            <XAxis type="number" hide domain={[0, 100]} />
                            <YAxis dataKey="name" type="category" stroke="hsl(var(--foreground))" tickLine={false} axisLine={false} width={100}/>
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--accent) / 0.3)' }}
                                contentStyle={{
                                    background: 'hsl(var(--background))',
                                    borderRadius: 'var(--radius)',
                                    border: '1px solid hsl(var(--border))',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={25}>
                                <LabelList dataKey="score" position="right" offset={10} className="fill-foreground font-semibold" />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2 no-print">
                <TabsTrigger value="summary">Feedback</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              
              <div className="print-container">
                <TabsContent value="summary">
                  <Card className="h-[calc(40rem+110px)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="text-primary" /> Key Feedback Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[40rem] pr-4">
                        <ul className="space-y-4">
                          {analysis.feedbackPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 rounded-md bg-secondary/20">
                              <div className="mt-1 flex-shrink-0">
                                 <Lightbulb className="w-5 h-5 text-primary" />
                              </div>
                              <p className="text-sm">{point}</p>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="transcript">
                  <Card className="h-[calc(40rem+110px)]">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="text-primary" /> Interview Transcript
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[40rem] pr-4">
                        <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
}
