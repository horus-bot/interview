'use client';

import { Lightbulb, FileText, PersonStanding, Download } from 'lucide-react';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AnalysisDashboardProps {
  videoUrl: string;
  transcript: string;
  analysis: ReasoningAnalysisOutput;
}

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
      <div className="bg-background min-h-screen p-4 md:p-8 print-container">
        <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between no-print">
          <h1 className="font-headline text-3xl font-bold text-primary">Analysis Report</h1>
          <Button onClick={handlePrint} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export to PDF
          </Button>
        </header>
        
        <div className="print-only hidden p-8">
           <h1 className="font-headline text-4xl font-bold text-primary mb-2">Interview Insights Report</h1>
           <p className="text-muted-foreground">Generated on: {new Date().toLocaleDateString()}</p>
           <hr className="my-6" />
        </div>

        <main className="max-w-7xl mx-auto grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
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
          </div>
          <div className="md:col-span-2">
            <Tabs defaultValue="summary" className="w-full no-print">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
                <TabsTrigger value="posture">Posture</TabsTrigger>
              </TabsList>
              <TabsContent value="summary">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="text-accent" /> Key Feedback Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <ul className="space-y-4">
                        {analysis.feedbackPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                               <Lightbulb className="w-5 h-5 text-accent" />
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
                      <FileText className="text-accent" /> Interview Transcript
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <p className="text-sm text-primary/90 whitespace-pre-wrap">{transcript}</p>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="posture">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PersonStanding className="text-accent" /> Body Language
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-96 flex items-center justify-center">
                      <p className="text-muted-foreground">Detailed posture analysis coming soon.</p>
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
                               <Lightbulb className="w-5 h-5 text-accent" />
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
