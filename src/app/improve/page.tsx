'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, MicVocal, PersonStanding, Lightbulb, Sparkles, AlertCircle, Video, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { speakAnalysis } from '@/ai/flows/speak-analysis';
import { starMethodStoryGenerator } from '@/ai/flows/star-method-generator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';


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

// Base camera component
const CameraActivity = ({ title, description, children }: { title: string, description: string, children: React.ReactNode }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        let stream: MediaStream | null = null;
        const getCameraPermission = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                setHasCameraPermission(true);
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setHasCameraPermission(false);
                toast({
                    variant: 'destructive',
                    title: 'Camera Access Denied',
                    description: 'Please enable camera permissions in your browser settings to use this feature.',
                });
            }
        };

        getCameraPermission();

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [toast]);

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">{title}</DialogTitle>

                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="relative w-full aspect-video bg-secondary rounded-lg overflow-hidden">
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {!hasCameraPermission && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Alert variant="destructive" className="max-w-sm">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Camera permission is required to use this feature.</AlertTitle>
                        </Alert>
                    </div>
                )}
                {hasCameraPermission && children}
            </div>
        </DialogContent>
    );
}

// Posture Practice Activity
const PosturePractice = () => (
    <CameraActivity title="Posture Practice" description="Use the guides to align your head and shoulders. Sit up straight and look directly into the camera.">
        <div className="absolute inset-0 pointer-events-none">
            {/* Horizontal line for shoulders */}
            <div className="absolute top-1/2 left-1/4 w-1/2 h-0.5 bg-primary/50 border-t-2 border-dashed border-primary-foreground"></div>
            {/* Vertical line for head */}
            <div className="absolute left-1/2 top-1/4 w-0.5 h-1/2 bg-primary/50 border-l-2 border-dashed border-primary-foreground"></div>
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center p-2 bg-black/30 rounded-md">
                <p className="text-white text-sm">Align Head Here</p>
            </div>
             <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 text-center p-2 bg-black/30 rounded-md -rotate-90">
                <p className="text-white text-sm">Shoulder Line</p>
            </div>
        </div>
    </CameraActivity>
);


// Eye Contact Training Activity
const EyeContactTraining = () => {
    const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTargetPosition({
                    x: Math.random() * 80 + 10, // from 10% to 90%
                    y: Math.random() * 80 + 10,
                });
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    return (
        <CameraActivity title="Eye Contact Training" description="Follow the blue dot with your eyes. Try to keep your head still and only move your eyes.">
            <div
                className="absolute w-6 h-6 bg-blue-500 rounded-full transition-all duration-1000 ease-in-out shadow-lg border-2 border-white"
                style={{
                    left: `${targetPosition.x}%`,
                    top: `${targetPosition.y}%`,
                    transform: 'translate(-50%, -50%)',
                }}
            />
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                <Button onClick={() => setIsRunning(!isRunning)} size="lg">
                    {isRunning ? <><Pause className="mr-2" /> Stop</> : <><Play className="mr-2"/> Start</>}
                </Button>
            </div>
        </CameraActivity>
    );
};

// Speaking Practice Activity Component
const SpeakingPractice = () => {
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
      <ScrollArea className="h-[60vh] p-4">
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
              <RefreshCw className="mr-2 h-4 w-4" /> New Question
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
      </ScrollArea>
    </DialogContent>
  );
};

// STAR Method Builder
const StarMethodBuilder = () => {
    const [situation, setSituation] = useState('');
    const [task, setTask] = useState('');
    const [action, setAction] = useState('');
    const [result, setResult] = useState('');
    const [generatedStory, setGeneratedStory] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleGenerateStory = async () => {
        if (!situation || !task || !action || !result) {
            toast({
                variant: 'destructive',
                title: 'Missing Fields',
                description: 'Please fill out all fields before generating a story.',
            });
            return;
        }

        setIsLoading(true);
        setGeneratedStory('');
        try {
            const response = await starMethodStoryGenerator({ situation, task, action, result });
            setGeneratedStory(response.story);
        } catch (error) {
            console.error("Failed to generate story:", error);
            toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: 'There was an error generating your story.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Lightbulb /> STAR Method Builder
                </DialogTitle>
                <DialogDescription>
                    Structure your accomplishments into compelling stories using the STAR method. Fill in each section and let AI help you craft the perfect narrative.
                </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-6 overflow-hidden flex-1">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4 p-1">
                      <div>
                          <Label htmlFor="situation" className="text-lg font-semibold">Situation</Label>
                          <p className="text-sm text-muted-foreground mb-2">Describe the context. Where and when did this take place?</p>
                          <Textarea id="situation" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g., At my previous job as a project manager..." className="min-h-[100px]"/>
                      </div>
                      <div>
                          <Label htmlFor="task" className="text-lg font-semibold">Task</Label>
                          <p className="text-sm text-muted-foreground mb-2">What was your goal or responsibility?</p>
                          <Textarea id="task" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g., My task was to launch a new feature..." className="min-h-[100px]"/>
                      </div>
                      <div>
                          <Label htmlFor="action" className="text-lg font-semibold">Action</Label>
                          <p className="text-sm text-muted-foreground mb-2">What specific steps did you take?</p>
                          <Textarea id="action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g., I organized a team, created a timeline..." className="min-h-[100px]"/>
                      </div>
                      <div>
                          <Label htmlFor="result" className="text-lg font-semibold">Result</Label>
                          <p className="text-sm text-muted-foreground mb-2">What was the outcome? Use numbers if possible.</p>
                          <Textarea id="result" value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g., As a result, we increased user engagement by 15%..." className="min-h-[100px]"/>
                      </div>
                  </div>
                </ScrollArea>
                <div className="flex flex-col gap-4 h-full">
                    <Button onClick={handleGenerateStory} disabled={isLoading} className="w-full">
                        <Sparkles className="mr-2" />
                        {isLoading ? 'Crafting Story...' : 'Refine with AI'}
                    </Button>
                    <Card className="flex-1 flex flex-col overflow-hidden">
                        <CardHeader>
                            <CardTitle>Your Polished Story</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto">
                            <ScrollArea className="h-full pr-2">
                              {isLoading ? (
                                  <p className="text-muted-foreground animate-pulse">Generating your story...</p>
                              ) : generatedStory ? (
                                  <p className="text-sm whitespace-pre-wrap">{generatedStory}</p>
                              ) : (
                                  <p className="text-muted-foreground">Your refined story will appear here.</p>
                              )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DialogContent>
    );
};


const activityComponents: { [key: string]: React.FC<any> } = {
  PosturePractice,
  EyeContactTraining,
  SpeakingPractice,
  StarMethodBuilder,
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 border-b">
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
            <Card key={index} className="bg-card border border-border hover:shadow-lg transition-all duration-200 flex flex-col">
              <CardHeader className="flex flex-row items-center gap-4">
                  {area.icon}
                  <div>
                    <CardTitle className="text-primary">{area.title}</CardTitle>
                    <CardDescription className="text-muted-foreground">{area.description}</CardDescription>
                  </div>
              </CardHeader>
              <CardContent className="mt-auto flex">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/80 transition-all duration-200" onClick={() => openActivity(area.component)}>
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {ActivityComponent && (
            <Dialog open={!!activeActivity} onOpenChange={onOpenChange}>
                <ActivityComponent />
            </Dialog>
        )}
      </main>
    </div>
  );
}
