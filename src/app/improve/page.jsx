'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, MicVocal, PersonStanding, Lightbulb, Sparkles, AlertCircle, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { speakAnalysis } from '@/ai/flows/speak-analysis';
import { starMethodStoryGenerator } from '@/ai/flows/star-method-generator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';


const improvementAreas = [
{
  icon: <PersonStanding />,
  title: 'Posture Practice',
  description: 'Check your posture in real-time to appear more confident.',
  component: 'PosturePractice'
},
{
  icon: <Eye />,
  title: 'Eye Contact Training',
  description: 'Practice maintaining steady eye contact with an on-screen guide.',
  component: 'EyeContactTraining'
},
{
  icon: <MicVocal />,
  title: 'Speaking Skills Exercise',
  description: 'Record yourself and get AI feedback on your vocal delivery.',
  component: 'SpeakingPractice'
},
{
  icon: <Lightbulb />,
  title: 'STAR Method Builder',
  description: 'Learn to structure your answers effectively with an interactive guide.',
  component: 'StarMethodBuilder'
}];


const interviewQuestions = [
"Tell me about a time you had to handle a difficult stakeholder.",
"Describe a project where you took the initiative to solve an unassigned problem.",
"Walk me through a complex project you managed from start to finish.",
"Tell me about a time you failed. What did you learn from it?"];


// Base camera component
const CameraActivity = ({ title, description, children }) => {
  const videoRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream = null;
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
          description: 'Please enable camera permissions in your browser settings to use this feature.'
        });
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [toast]);

  return (
    <DialogContent style={{ maxWidth: '42rem', borderRadius: '1rem', overflow: 'hidden', padding: 0, gap: 0, border: '1px solid hsl(var(--border))' }}>
            <DialogHeader style={{ padding: '1.5rem', backgroundColor: 'hsl(var(--muted)/0.5)', borderBottom: '1px solid hsl(var(--border))' }}>
                <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 700 }}>{title}</DialogTitle>
                <DialogDescription style={{ fontSize: '0.95rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem' }}>{description}</DialogDescription>
            </DialogHeader>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', backgroundColor: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {!hasCameraPermission &&
        <div style={{ position: 'absolute', inset: 0, padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Alert variant="destructive" style={{ backgroundColor: 'hsl(var(--destructive)/0.1)', borderColor: 'hsl(var(--destructive)/0.3)' }}>
                            <AlertCircle size={18} />
                            <AlertTitle style={{ marginLeft: '0.5rem' }}>Camera permission is required to use this feature.</AlertTitle>
                        </Alert>
                    </div>
        }
                {hasCameraPermission && children}
            </div>
        </DialogContent>);

};

// Posture Practice Activity
const PosturePractice = () =>
<CameraActivity title="Posture Practice" description="Use the guides to align your head and shoulders. Sit up straight and look directly into the camera.">
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {/* Horizontal line for shoulders */}
            <div style={{ position: 'absolute', top: '70%', left: '10%', right: '10%', height: '2px', backgroundColor: 'rgba(74, 222, 128, 0.7)', border: '1px dashed rgba(255,255,255,0.5)', boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}></div>
            {/* Vertical line for head */}
            <div style={{ position: 'absolute', top: '15%', bottom: '30%', left: '50%', width: '2px', backgroundColor: 'rgba(74, 222, 128, 0.7)', border: '1px dashed rgba(255,255,255,0.5)', transform: 'translateX(-50%)', boxShadow: '0 0 10px rgba(74, 222, 128, 0.5)' }}></div>
            <div style={{ position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '2rem', backdropFilter: 'blur(4px)' }}>
                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Align Head Here</p>
            </div>
             <div style={{ position: 'absolute', top: '63%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', padding: '0.5rem 1rem', borderRadius: '2rem', backdropFilter: 'blur(4px)' }}>
                <p style={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, margin: 0, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Shoulder Line</p>
            </div>
        </div>
    </CameraActivity>;



// Eye Contact Training Activity
const EyeContactTraining = () => {
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTargetPosition({
          x: Math.random() * 80 + 10, // from 10% to 90%
          y: Math.random() * 80 + 10
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
        style={{
          position: 'absolute',
          width: '24px',
          height: '24px',
          backgroundColor: '#3b82f6',
          borderRadius: '50%',
          boxShadow: '0 0 15px 5px rgba(59, 130, 246, 0.6)',
          left: `${targetPosition.x}%`,
          top: `${targetPosition.y}%`,
          transform: 'translate(-50%, -50%)',
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          display: isRunning ? 'block' : 'none'
        }} />
      
             <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '1rem', backdropFilter: 'blur(8px)' }}>
                <Button onClick={() => setIsRunning(!isRunning)} size="lg" style={{ borderRadius: '2rem', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isRunning ? <><Pause size={18} /> Stop</> : <><Play size={18} /> Start</>}
                </Button>
            </div>
        </CameraActivity>);

};

// Speaking Practice Activity Component
const SpeakingPractice = () => {
  const [question, setQuestion] = useState(interviewQuestions[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
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
        description: 'Please enable microphone access in your browser settings.'
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
      const audioBlob = await fetch(audioUrl).then((res) => res.blob());
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
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
  };

  return (
    <DialogContent style={{ maxWidth: '42rem', borderRadius: '1rem', padding: '1.5rem' }}>
      <DialogHeader style={{ marginBottom: '1.5rem' }}>
        <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))' }}>
            <MicVocal /> Speaking Skills Exercise
        </DialogTitle>
        <DialogDescription style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem', marginTop: '0.5rem' }}>
          Record your answer to the question below and get instant AI feedback.
        </DialogDescription>
      </DialogHeader>
      <ScrollArea style={{ maxHeight: '60vh', paddingRight: '1rem' }}>
        <Card style={{ marginBottom: '1.5rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--muted)/0.3)' }}>
          <CardContent style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '1.125rem', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>"{question}"</p>
          </CardContent>
        </Card>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {!isRecording ?
          <Button onClick={handleStartRecording} size="lg" disabled={isLoading} style={{ borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', flex: 1 }}>
              <MicVocal size={18} /> Start Recording
            </Button> :

          <Button onClick={handleStopRecording} variant="destructive" size="lg" style={{ borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', flex: 1, animation: 'pulse 2s infinite' }}>
              <MicVocal size={18} /> Stop Recording
            </Button>
          }
          <Button onClick={selectNewQuestion} variant="outline" size="lg" disabled={isRecording || isLoading} style={{ borderRadius: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              <RefreshCw size={18} /> New Question
          </Button>
        </div>
        
        {audioUrl &&
        <div style={{ padding: '1.5rem', backgroundColor: 'hsl(var(--muted)/0.5)', borderRadius: '1rem', border: '1px solid hsl(var(--border))', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <audio src={audioUrl} controls style={{ width: '100%', height: '40px', outline: 'none' }} />
                <Button onClick={handleAnalyze} disabled={isLoading} style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                    {isLoading ? 'Analyzing...' : <> <Sparkles size={18} /> Analyze My Answer </>}
                </Button>
            </div>
        }

        {isLoading && <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>Analyzing your speech... <RefreshCw size={24} style={{ animation: 'spin 2s linear infinite', display: 'inline-block', marginLeft: '0.5rem' }} /></div>}

        {feedback &&
        <Card style={{ backgroundColor: 'hsl(var(--primary)/0.05)', border: '1px solid hsl(var(--primary)/0.2)' }}>
                <CardHeader>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))' }}><Sparkles size={18} /> AI Feedback</CardTitle>
                </CardHeader>
                <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <Lightbulb size={20} style={{ color: '#eab308', flexShrink: 0, marginTop: '0.25rem' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Clarity:</strong> 
                        <span style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{feedback.clarity}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <RefreshCw size={20} style={{ color: '#3b82f6', flexShrink: 0, marginTop: '0.25rem' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Pacing:</strong> 
                        <span style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{feedback.pacing}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <AlertCircle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.25rem' }} />
                      <div>
                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Filler Words:</strong> 
                        <span style={{ color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{feedback.fillerWords}</span>
                      </div>
                    </div>
                </CardContent>
            </Card>
        }
      </ScrollArea>
      <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
      ` }} />
    </DialogContent>);

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
        description: 'Please fill out all fields before generating a story.'
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
        description: 'There was an error generating your story.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent style={{ maxWidth: '48rem', borderRadius: '1rem', padding: 0, overflow: 'hidden' }}>
            <DialogHeader style={{ padding: '1.5rem', backgroundColor: 'hsl(var(--muted)/0.5)', borderBottom: '1px solid hsl(var(--border))' }}>
                <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--primary))' }}>
                    <Lightbulb size={24} /> STAR Method Builder
                </DialogTitle>
                <DialogDescription style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1rem', marginTop: '0.5rem' }}>
                    Structure your accomplishments into compelling stories using the STAR method. Fill in each section and let AI help you craft the perfect narrative.
                </DialogDescription>
            </DialogHeader>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', padding: '1.5rem', maxHeight: '70vh' }}>
                <ScrollArea style={{ paddingRight: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Label htmlFor="situation" style={{ fontSize: '1rem', fontWeight: 600 }}>Situation</Label>
                          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>Describe the context. Where and when did this take place?</p>
                          <Textarea id="situation" value={situation} onChange={(e) => setSituation(e.target.value)} placeholder="e.g., At my previous job as a project manager..." style={{ height: '5rem', resize: 'none', borderRadius: '0.5rem' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Label htmlFor="task" style={{ fontSize: '1rem', fontWeight: 600 }}>Task</Label>
                          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>What was your goal or responsibility?</p>
                          <Textarea id="task" value={task} onChange={(e) => setTask(e.target.value)} placeholder="e.g., My task was to launch a new feature..." style={{ height: '5rem', resize: 'none', borderRadius: '0.5rem' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Label htmlFor="action" style={{ fontSize: '1rem', fontWeight: 600 }}>Action</Label>
                          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>What specific steps did you take?</p>
                          <Textarea id="action" value={action} onChange={(e) => setAction(e.target.value)} placeholder="e.g., I organized a team, created a timeline..." style={{ height: '5rem', resize: 'none', borderRadius: '0.5rem' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                          <Label htmlFor="result" style={{ fontSize: '1rem', fontWeight: 600 }}>Result</Label>
                          <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>What was the outcome? Use numbers if possible.</p>
                          <Textarea id="result" value={result} onChange={(e) => setResult(e.target.value)} placeholder="e.g., As a result, we increased user engagement by 15%..." style={{ height: '5rem', resize: 'none', borderRadius: '0.5rem' }} />
                      </div>
                  </div>
                </ScrollArea>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <Button onClick={handleGenerateStory} disabled={isLoading} style={{ width: '100%', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', padding: '1.5rem', fontSize: '1.125rem' }}>
                        <Sparkles size={20} />
                        {isLoading ? 'Crafting Story...' : 'Refine with AI'}
                    </Button>
                    <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid hsl(var(--primary)/0.2)', backgroundColor: 'hsl(var(--primary)/0.02)' }}>
                        <CardHeader style={{ padding: '1rem', borderBottom: '1px solid hsl(var(--border))' }}>
                            <CardTitle style={{ fontSize: '1.125rem', color: 'hsl(var(--primary))' }}>Your Polished Story</CardTitle>
                        </CardHeader>
                        <CardContent style={{ padding: '1rem', flex: 1, overflow: 'hidden' }}>
                            <ScrollArea style={{ height: '100%' }}>
                              {isLoading ?
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--muted-foreground))' }}>
                                    <RefreshCw size={16} style={{ animation: 'spin 2s linear infinite' }} /> Generating your story...
                                  </div> :
                generatedStory ?
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>{generatedStory}</p> :

                <p style={{ color: 'hsl(var(--muted-foreground))', fontStyle: 'italic', margin: 0 }}>Your refined story will appear here once generated.</p>
                }
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
            {isLoading && <style dangerouslySetInnerHTML={{ __html: '@keyframes spin { 100% { transform: rotate(360deg); } }' }} />}
        </DialogContent>);

};


const activityComponents = {
  PosturePractice,
  EyeContactTraining,
  SpeakingPractice,
  StarMethodBuilder
};

export default function ImprovePage() {
  const [activeActivity, setActiveActivity] = useState(null);

  const openActivity = (componentName) => {
    setActiveActivity(componentName);
  };

  const onOpenChange = (open) => {
    if (!open) {
      setActiveActivity(null);
    }
  };

  const ActivityComponent = activeActivity ? activityComponents[activeActivity] : null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--foreground))', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card) / 0.85)', backdropFilter: 'blur(12px)', padding: '1rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', alignItems: 'center', width: '100%', gap: '1rem' }}>
          <Button asChild variant="outline" style={{ borderRadius: '0.5rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </Button>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Improve Yourself</h1>
        </div>
      </header>
      
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <div style={{ textAlign: 'center', maxWidth: '48rem', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, color: 'hsl(var(--primary))', letterSpacing: '-0.03em', marginBottom: '1rem' }}>Interactive Improvement Toolkit</h2>
          <p style={{ color: 'hsl(var(--muted-foreground))', fontSize: '1.125rem', lineHeight: 1.6 }}>
            Actively practice and enhance your interview skills with these AI-powered exercises.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {improvementAreas.map((area, index) =>
          <Card key={index} style={{ display: 'flex', flexDirection: 'column', borderRadius: '1rem', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--card))', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', transition: 'transform 0.2s', overflow: 'hidden' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
            
              <CardHeader style={{ padding: '1.5rem', paddingBottom: '1rem' }}>
                  <div style={{ background: 'hsla(var(--primary), 0.1)', color: 'hsl(var(--primary))', padding: '1rem', borderRadius: '50%', display: 'inline-flex', marginBottom: '1rem', alignSelf: 'flex-start' }}>
                    {area.icon}
                  </div>
                  <div>
                    <CardTitle style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>{area.title}</CardTitle>
                    <CardDescription style={{ fontSize: '0.95rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.5 }}>{area.description}</CardDescription>
                  </div>
              </CardHeader>
              <CardContent style={{ padding: '1.5rem', paddingTop: 0, marginTop: 'auto' }}>
                <Button onClick={() => openActivity(area.component)} style={{ width: '100%', borderRadius: '0.5rem', fontWeight: 600 }}>
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {ActivityComponent &&
        <Dialog open={!!activeActivity} onOpenChange={onOpenChange}>
                <ActivityComponent />
            </Dialog>
        }
      </main>
    </div>);

}