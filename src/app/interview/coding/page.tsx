
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, Send, Bot, Code, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/context/auth-context';
import { generateCodingQuestions, analyzeCodingAttempt } from '@/ai/flows/coding-interview-flow';
import type { CodingQuestion } from '@/ai/flows/coding-interview-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

type InterviewStage = 'setup' | 'in_progress' | 'processing' | 'finished';

const roles = ["Python Developer", "ML Engineer", "Web Developer", "Data Analyst", "Database Manager"];
const levels = ["Entry Level", "Mid Level", "Senior Level"];
const questionCounts = ["1", "3", "5"];

function CodingInterviewPage() {
    const [stage, setStage] = useState<InterviewStage>('setup');
    const [config, setConfig] = useState({ role: '', level: '', numQuestions: '' });
    const [questions, setQuestions] = useState<CodingQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [processingState, setProcessingState] = useState({progress: 0, message: ''});
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const allRecordedBlobs = useRef<Blob[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        const setupMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) videoRef.current.srcObject = stream;
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = recorder;
            } catch (error) {
                toast({
                    variant: 'destructive',
                    title: 'Media Access Denied',
                    description: 'Camera and microphone are required for analysis.',
                });
                router.push('/interview');
            }
        };
        setupMedia();
    }, [toast, router]);

    const handleStartInterview = async () => {
        if (!config.role || !config.level || !config.numQuestions) {
            toast({ variant: 'destructive', title: 'Setup Incomplete', description: 'Please select a role, level, and number of questions.' });
            return;
        }
        setIsGenerating(true);
        try {
            const result = await generateCodingQuestions({
                role: config.role,
                level: config.level,
                count: parseInt(config.numQuestions, 10),
            });
            if (result.questions.length > 0) {
                setQuestions(result.questions);
                setStage('in_progress');
                mediaRecorderRef.current?.start();
            } else {
                toast({ variant: 'destructive', title: 'Failed to generate questions.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate interview questions. Please try again.' });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleNextQuestion = async () => {
        if (!mediaRecorderRef.current) return;
        
        mediaRecorderRef.current.pause();
        const videoBlob = await new Promise<Blob>((resolve) => {
             mediaRecorderRef.current!.ondataavailable = (e) => resolve(e.data);
             mediaRecorderRef.current!.requestData();
        });
        mediaRecorderRef.current.resume();

        allRecordedBlobs.current.push(videoBlob);
        
        const isLastQuestion = currentQuestionIndex === questions.length - 1;
        if (isLastQuestion) {
            handleFinishInterview();
        } else {
            setCurrentQuestionIndex(prev => prev + 1);
            setCode('');
        }
    };
    
    const handleFinishInterview = async () => {
        setStage('processing');
        mediaRecorderRef.current?.stop();
        
        const combinedVideoBlob = new Blob(allRecordedBlobs.current, { type: 'video/webm' });

        setProcessingState({progress: 10, message: 'Preparing your video...'});
        const reader = new FileReader();
        reader.readAsDataURL(combinedVideoBlob);
        reader.onloadend = async () => {
            const videoDataUri = reader.result as string;
            setProcessingState({progress: 30, message: 'Analyzing your solution...'});
            try {
                const analysisResult = await analyzeCodingAttempt({
                    videoDataUri,
                    question: questions[currentQuestionIndex].question,
                    code: code,
                    role: config.role,
                    level: config.level,
                });
                setProcessingState({progress: 90, message: 'Finalizing report...'});
                const videoUrl = URL.createObjectURL(combinedVideoBlob);
                sessionStorage.setItem('videoUrl', videoUrl);
                sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
                sessionStorage.setItem('analysisType', 'coding');
                router.push('/analysis');
            } catch(e) {
                 toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze your submission.' });
                 setStage('in_progress');
            }
        }
    }

    const renderSetup = () => (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Coding Interview Setup</CardTitle>
                    <CardDescription>Configure your technical mock interview.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Select onValueChange={(value) => setConfig(c => ({...c, role: value}))}>
                        <SelectTrigger><SelectValue placeholder="Select a Role" /></SelectTrigger>
                        <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select onValueChange={(value) => setConfig(c => ({...c, level: value}))}>
                        <SelectTrigger><SelectValue placeholder="Select a Level" /></SelectTrigger>
                        <SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select onValueChange={(value) => setConfig(c => ({...c, numQuestions: value}))}>
                        <SelectTrigger><SelectValue placeholder="Number of Questions" /></SelectTrigger>
                        <SelectContent>{questionCounts.map(n => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={handleStartInterview} className="w-full" disabled={isGenerating}>
                        {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Generating...</> : 'Start Interview'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
    
    const renderInterview = () => (
        <div className="grid md:grid-cols-2 gap-4 h-full p-4">
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Question {currentQuestionIndex + 1} of {questions.length}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow overflow-y-auto">
                    <p className="whitespace-pre-wrap">{questions[currentQuestionIndex]?.question}</p>
                </CardContent>
            </Card>
            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle>Your Code</CardTitle>
                    <CardDescription>Explain your thought process as you code. This will be analyzed.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                    <Textarea 
                        value={code} 
                        onChange={e => setCode(e.target.value)}
                        placeholder="Type your code here..."
                        className="flex-grow font-mono text-sm resize-none"
                    />
                    <Button onClick={handleNextQuestion} className="w-full mt-4">
                        <Send className="mr-2"/>
                        {currentQuestionIndex === questions.length - 1 ? 'Finish & Analyze' : 'Submit & Next Question'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
    
    const renderProcessing = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <h2 className="text-2xl font-bold mb-4">{processingState.message}</h2>
            <Progress value={processingState.progress} className="w-full max-w-md"/>
        </div>
    );

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="p-4 flex justify-between items-center">
                <Button asChild variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
                    <Link href="/interview">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Interview Types
                    </Link>
                </Button>
                <div className="text-lg font-semibold flex items-center gap-2"><Code /> Coding Mock Interview</div>
                <div className="w-32">
                    <video ref={videoRef} className="w-full rounded-md aspect-video object-cover" autoPlay muted playsInline />
                </div>
            </header>
            <main className="flex-1 bg-gray-800 rounded-t-lg overflow-hidden">
                {stage === 'setup' && renderSetup()}
                {stage === 'in_progress' && renderInterview()}
                {stage === 'processing' && renderProcessing()}
            </main>
        </div>
    );
}

export default withAuth(CodingInterviewPage);
