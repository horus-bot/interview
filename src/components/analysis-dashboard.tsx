'use client';

import { Lightbulb, FileText, PersonStanding, Download, BarChartHorizontal } from 'lucide-react';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

interface AnalysisDashboardProps {
  videoUrl: string;
  transcript: string;
  analysis: ReasoningAnalysisOutput;
}

const chartData = [
  { name: 'Clarity', score: 85 },
  { name: 'Confidence', score: 78 },
  { name: 'Conciseness', score: 92 },
  { name: 'Body Language', score: 65 },
  { name: 'Pacing', score: 88 },
];

export function AnalysisDashboard({ videoUrl, transcript, analysis }: AnalysisDashboardProps) {
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
          .print-only {
            display: block !important;
          }
          .print-container {
             padding: 0 !important;
             margin: 0 !important;
             box-shadow: none !important;
             border: none !important;
          }
          .print-break-after {
            page-break-after: always;
          }
        }
      `}</style>
      <div className="bg-secondary/50 min-h-screen">
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b no-print">
            <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-primary">Analysis Report</h1>
                <Button onClick={handlePrint} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export to PDF
                </Button>
            </div>
        </header>
        
        <div className="print-only hidden p-8">
           <h1 className="font-headline text-4xl font-bold text-primary mb-2">Interview Insights Report</h1>
           <p className="text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
           <hr className="my-6" />
        </div>

        <main className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8 p-4 md:p-8">
          <div className="md:col-span-3 space-y-8">
            <Card className="overflow-hidden shadow-lg no-print">
              <CardContent className="p-0">
                <video controls src={videoUrl} className="w-full aspect-video" />
              </CardContent>
            </Card>
            <div className="print-only hidden">
                <Card>
                    <CardHeader><CardTitle>Video Analysis</CardTitle></CardHeader>
                    <CardContent><p className="text-muted-foreground">Video player is not available in the exported PDF. Refer to your original video file.</p></CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="text-primary" /> Performance Scores
                    </CardTitle>
                    <CardDescription>A visual breakdown of key performance metrics.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="#555" tickLine={false} axisLine={false} width={100}/>
                            <Tooltip
                                cursor={{ fill: 'rgba(215, 225, 255, 0.3)' }}
                                contentStyle={{
                                    background: 'white',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e0e0e0',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}
                            />
                            <Bar dataKey="score" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={25} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
             </Card>
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="summary" className="w-full no-print">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Feedback</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="text-primary" /> Key Feedback Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[40rem]">
                      <ul className="space-y-4">
                        {analysis.feedbackPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                               <Lightbulb className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-primary/90">{point}</p>
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="transcript">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="text-primary" /> Interview Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[40rem]">
                      <p className="text-sm text-primary/90 whitespace-pre-wrap">{transcript}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <div className="print-only hidden space-y-8">
                <Card className="print-break-after">
                  <CardHeader><CardTitle>Key Feedback Points</CardTitle></CardHeader>
                   <CardContent>
                      <ul className="space-y-4">
                        {analysis.feedbackPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                             <div className="mt-1 flex-shrink-0">
                               <Lightbulb className="w-5 h-5 text-primary" />
                            </div>
                            <p className="text-sm text-primary/90">{point}</p>
                          </li>
                        ))}
                      </ul>
                   </CardContent>
                </Card>
                 <Card>
                  <CardHeader><CardTitle>Interview Transcript</CardTitle></CardHeader>
                  <CardContent>
                     <p className="text-sm text-primary/90 whitespace-pre-wrap">{transcript}</p>
                  </CardContent>
                </Card>
            </div>

          </div>
        </main>
      </div>
    </>
  );
}
