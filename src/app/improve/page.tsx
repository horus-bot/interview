'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, MicVocal, PersonStanding, Lightbulb, Sparkles, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { speakAnalysis } from '@/ai/flows/speak-analysis';

const improvementAreas = [
  {
    icon: <PersonStanding className="h-8 w-8 text-primary" />,
    title: 'Posture Practice',
    description: 'Check your posture in real-time to appear more confident.',
    component: 'PosturePractice',
  },
  {
    icon: <Eye className="h-8 w-8 text-primary" />,
    title: 'Eye Contact Training',
    description: 'Practice maintaining steady eye contact with an on-screen guide.',
    component: 'EyeContactTraining',
  },
  {
    icon: <MicVocal className="h-8 w-8 text-primary" />,
    title: 'Speaking Skills Exercise',
    description: 'Record yourself and get AI feedback on your vocal delivery.',
    component: 'SpeakingPractice',
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'STAR Method Builder',
    description: 'Learn to structure your answers effectively with an interactive guide.',
    component: 'StarMethodBuilder',
  },
];

const interviewQuestions = [
    "Tell me about a time you had to handle a difficult stakeholder.",
    "Describe a project where you took the initiative to solve an unassigned problem.",
    "Walk me through a complex project you managed from start to finish.",
    "Tell me about a time you failed. What did you learn from it?",
];

// Placeholder component for future activities
const PlaceholderActivity = ({ title, onOpenChange }: { title: string, onOpenChange: (open: boolean) => void }) => (
  <DialogContent>
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>
        This interactive exercise is coming soon. Stay tuned for updates!
      </DialogDescription>
    </DialogHeader>
    <div className="py-8 text-center">
      <p className="text-muted-foreground">Coming Soon!</p>
    </div>
    <DialogClose asChild>
      <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
        Close
      </Button>
    </DialogClose>
  </DialogContent>
);

// Speaking Practice Activity Component
const SpeakingPractice = ({ onOpenChange }: { onOpenChange: (open: boolean) => void }) => {
  const [question, setQuestion] = useState(interviewQuestions[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setFeedback(null);
      setAudioUrl(null);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone access in your browser settings.',
      });
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAnalyze = async () => {
      if (!audioUrl) return;

      setIsLoading(true);
      setFeedback(null);
      
      try {
        const audioBlob = await fetch(audioUrl).then(res => res.blob());
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const result = await speakAnalysis({ audioDataUri: base64Audio });
            setFeedback(result);
        };
      } catch (error) {
          console.error("Analysis failed:", error);
          toast({
              variant: 'destructive',
              title: 'Analysis Failed',
              description: 'Something went wrong while analyzing your audio.'
          });
      } finally {
          setIsLoading(false);
      }
  };
  
  const selectNewQuestion = () => {
    const newQuestion = interviewQuestions[Math.floor(Math.random() * interviewQuestions.length)];
    setQuestion(newQuestion);
    setAudioUrl(null);
    setFeedback(null);
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
            <MicVocal /> Speaking Skills Exercise
        </DialogTitle>
        <DialogDescription>
          Record your answer to the question below and get instant AI feedback.
        </DialogDescription>
      </DialogHeader>
      
      <Card className="bg-secondary/50">
        <CardContent className="p-4">
            <p className="text-center font-medium">"{question}"</p>
        </CardContent>
      </Card>
      
      <div className="flex justify-center items-center gap-4 my-4">
        {!isRecording ? (
          <Button onClick={handleStartRecording} size="lg" disabled={isLoading}>
            <MicVocal className="mr-2" /> Start Recording
          </Button>
        ) : (
          <Button onClick={handleStopRecording} variant="destructive" size="lg">
            <MicVocal className="mr-2 animate-pulse" /> Stop Recording
          </Button>
        )}
        <Button onClick={selectNewQuestion} variant="outline" disabled={isRecording || isLoading}>
            New Question
        </Button>
      </div>
      
      {audioUrl && (
          <div className="space-y-4">
              <audio src={audioUrl} controls className="w-full" />
              <Button onClick={handleAnalyze} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Analyzing...' : <> <Sparkles className="mr-2"/> Analyze My Answer </>}
              </Button>
          </div>
      )}

      {isLoading && <div className="text-center p-4">Analyzing your speech...</div>}

      {feedback && (
          <Card>
              <CardHeader>
                  <CardTitle>AI Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-1 text-primary"/>
                    <p><strong>Clarity:</strong> {feedback.clarity}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-1 text-primary"/>
                    <p><strong>Pacing:</strong> {feedback.pacing}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 mt-1 text-primary"/>
                    <p><strong>Filler Words:</strong> {feedback.fillerWords}</p>
                  </div>
              </CardContent>
          </Card>
      )}

    </DialogContent>
  );
};


const activityComponents: { [key: string]: React.FC<any> } = {
  PosturePractice: (props) => <PlaceholderActivity title="Posture Practice" {...props} />,
  EyeContactTraining: (props) => <PlaceholderActivity title="Eye Contact Training" {...props} />,
  SpeakingPractice,
  StarMethodBuilder: (props) => <PlaceholderActivity title="STAR Method Builder" {...props} />,
};

export default function ImprovePage() {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);

  const openActivity = (componentName: string) => {
    setActiveActivity(componentName);
  };
  
  const onOpenChange = (open: boolean) => {
      if(!open) {
          setActiveActivity(null);
      }
  }

  const ActivityComponent = activeActivity ? activityComponents[activeActivity] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b">
        <div className="max-w-5xl mx-auto p-4 flex items-center justify-between">
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-primary">Improve Yourself</h1>
          <div />
        </div>
      </header>
      
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold tracking-tight">Interactive Improvement Toolkit</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Actively practice and enhance your interview skills with these AI-powered exercises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {improvementAreas.map((area, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                  {area.icon}
                  <div>
                    <CardTitle>{area.title}</CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button className="w-full" onClick={() => openActivity(area.component)}>
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {ActivityComponent && (
            <Dialog open={!!activeActivity} onOpenChange={onOpenChange}>
                <ActivityComponent onOpenChange={onOpenChange} />
            </Dialog>
        )}
      </main>
    </div>
  );
}
