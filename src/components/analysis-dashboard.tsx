
'use client';

import { Lightbulb, FileText, Download, BarChartHorizontal, Video, Mic, UserCheck, CheckCircle, MessageSquareQuote } from 'lucide-react';
import type { ReasoningAnalysisOutput } from '@/ai/flows/reasoning-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface AnalysisDashboardProps {
  videoUrl: string;
  analysis: ReasoningAnalysisOutput;
}

const calculateScore = (text: string): number => {
    const maxLength = 400; // The length of text at which the score is minimal
    const minScore = 65;
    const maxScore = 95;

    // Clamp the length between 0 and maxLength
    const effectiveLength = Math.max(0, Math.min(text.length, maxLength));

    // Linear interpolation: score decreases as length increases
    const score = maxScore - (effectiveLength / maxLength) * (maxScore - minScore);
    
    return Math.floor(score);
}

export function AnalysisDashboard({ videoUrl, analysis }: AnalysisDashboardProps) {
  const router = useRouter();
  const handlePrint = () => {
    window.print();
  };

  const videoScores = [
      { name: 'Posture', score: calculateScore(analysis.videoAnalysis.posture) },
      { name: 'Body Language', score: calculateScore(analysis.videoAnalysis.bodyLanguage) },
      { name: 'Eye Contact', score: calculateScore(analysis.videoAnalysis.eyeContact) },
  ];

  const vocalScores = [
      { name: 'Clarity', score: calculateScore(analysis.vocalAnalysis.clarity) },
      { name: 'Pacing', score: calculateScore(analysis.vocalAnalysis.pacing) },
  ]


  return (
    <>
      <style jsx global>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          main { padding: 0 !important; }
          .print-container { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; background: white !important; }
          .print-break-after { page-break-after: always; }
          .print-no-break { page-break-inside: avoid; }
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

        <main className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8 p-4 md:p-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="overflow-hidden shadow-lg no-print">
              <CardContent className="p-0">
                <video controls src={videoUrl} className="w-full aspect-video rounded-t-lg" />
              </CardContent>
            </Card>

             <Card className="print-container print-no-break">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChartHorizontal className="text-primary" /> Overall Scores
                    </CardTitle>
                    <CardDescription>A visual breakdown of key performance metrics based on your video.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold mb-2">Video</h3>
                        {videoScores.map(item => (
                            <div key={item.name} className="flex items-center mb-2">
                                <span className="w-32 text-sm text-muted-foreground">{item.name}</span>
                                <div className="flex-1 bg-muted rounded-full h-4">
                                    <div className="bg-primary h-4 rounded-full" style={{ width: `${item.score}%`}}></div>
                                </div>
                                <span className="w-12 text-right font-semibold text-sm">{item.score}</span>
                            </div>
                        ))}
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">Vocal</h3>
                        {vocalScores.map(item => (
                            <div key={item.name} className="flex items-center mb-2">
                                <span className="w-32 text-sm text-muted-foreground">{item.name}</span>
                                <div className="flex-1 bg-muted rounded-full h-4">
                                    <div className="bg-primary h-4 rounded-full" style={{ width: `${item.score}%`}}></div>
                                </div>
                                <span className="w-12 text-right font-semibold text-sm">{item.score}</span>
                            </div>
                        ))}
                         <div className="flex items-center mt-4 text-sm text-muted-foreground">
                            <span className="w-32">Filler Words</span>
                            <span className="font-semibold text-foreground">{analysis.vocalAnalysis.fillerWordCount}</span>
                        </div>
                         <div className="flex items-center text-sm text-muted-foreground">
                            <span className="w-32">Casual Words</span>
                            <span className="font-semibold text-foreground">{analysis.vocalAnalysis.unprofessionalWordCount}</span>
                        </div>
                    </div>
                </CardContent>
             </Card>

             <Card className="print-container print-no-break">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="text-primary" /> Actionable Guidance
                  </CardTitle>
                  <CardDescription>Your top priorities for improvement based on the full analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                      {analysis.guidance.map((point, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
                          <p className="text-sm">{point}</p>
                        </li>
                      ))}
                    </ul>
                </CardContent>
             </Card>

             <div className="print-break-after" />

             <Card className="print-container print-no-break">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" /> Interview Transcript
                </CardTitle>
                <CardDescription>A full transcript of the interview, separated by speaker.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[40rem] pr-4">
                  <p className="text-sm whitespace-pre-wrap">{analysis.transcript}</p>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1 space-y-8">
            <Card className="print-container print-no-break">
                <CardHeader>
                    <CardTitle>Interview Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{analysis.interviewSummary}</p>
                </CardContent>
            </Card>
            <Accordion type="multiple" defaultValue={['content-analysis', 'video-analysis', 'vocal-analysis']} className="w-full space-y-8">
                 <Card className="print-container print-no-break">
                    <AccordionItem value="content-analysis" className="border-b-0">
                        <AccordionTrigger className="p-6">
                            <CardTitle className="flex items-center gap-2">
                                <MessageSquareQuote className="text-primary" /> Content Analysis
                            </CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="font-semibold text-primary">Answer Clarity & Structure</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.contentAnalysis.answerClarity}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-primary">Relevance of Answers</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.contentAnalysis.relevance}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-primary">Improvement Suggestions</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.contentAnalysis.improvementSuggestions}</dd>
                                </div>
                            </dl>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>
            
                 <Card className="print-container print-no-break">
                    <AccordionItem value="video-analysis" className="border-b-0">
                        <AccordionTrigger className="p-6">
                            <CardTitle className="flex items-center gap-2">
                                <Video className="text-primary" /> Video Analysis
                            </CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="font-semibold text-primary">Posture</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.videoAnalysis.posture}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-primary">Body Language</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.videoAnalysis.bodyLanguage}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-primary">Eye Contact</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.videoAnalysis.eyeContact}</dd>
                                </div>
                            </dl>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>

                 <Card className="print-container print-no-break">
                    <AccordionItem value="vocal-analysis" className="border-b-0">
                         <AccordionTrigger className="p-6">
                            <CardTitle className="flex items-center gap-2">
                                <Mic className="text-primary" /> Vocal Analysis
                            </CardTitle>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                            <dl className="space-y-4">
                                <div>
                                    <dt className="font-semibold text-primary">Clarity</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.vocalAnalysis.clarity}</dd>
                                </div>
                                <div>
                                    <dt className="font-semibold text-primary">Pacing</dt>
                                    <dd className="text-sm text-muted-foreground mt-1">{analysis.vocalAnalysis.pacing}</dd>
                                </div>
                            </dl>
                        </AccordionContent>
                    </AccordionItem>
                 </Card>
            </Accordion>
            
          </div>
        </main>
      </div>
    </>
  );
}
