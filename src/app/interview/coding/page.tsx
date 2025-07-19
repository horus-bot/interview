
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, Send, Bot, Code, Loader2, Volume2, MicOff, VideoOff, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/context/auth-context';
import { generateCodingQuestions, analyzeCodingAttempt, CodingQuestion } from '@/ai/flows/coding-interview-flow';
import { textToSpeech } from '@/ai/flows/tts-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Stage = 'setup' | 'intro' | 'conceptual' | 'coding' | 'processing' | 'error';
type InterviewerMessage = { speaker: 'ai' | 'user' | 'system'; text: string; audioUrl?: string };

const roles = ["Python Developer", "ML Engineer", "Web Developer", "Data Analyst", "Database Manager"];
const levels = ["Entry Level", "Mid Level", "Senior Level"];
const questionCounts = ["1", "3"];

function CodingInterviewPage() {
    const [stage, setStage] = useState<Stage>('setup');
    const [config, setConfig] = useState({ role: '', level: '', numQuestions: '1' });
    const [questions, setQuestions] = useState<CodingQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [processingState, setProcessingState] = useState({ progress: 0, message: '' });
    const [messages, setMessages] = useState<InterviewerMessage[]>([]);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement>(null);

    const { toast } = useToast();
    const router = useRouter();
    
    // Media Setup Effect
    useEffect(() => {
        const setupMedia = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setHasPermission(true);
                if (videoRef.current) videoRef.current.srcObject = stream;
                
                const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                mediaRecorderRef.current = recorder;

                recorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunksRef.current.push(event.data);
                    }
                };
            } catch (error) {
                setHasPermission(false);
                toast({ variant: 'destructive', title: 'Media Access Denied', description: 'Camera and microphone are required.' });
            }
        };
        setupMedia();
    }, [toast]);
    
    const say = useCallback(async (text: string) => {
        setIsAISpeaking(true);
        try {
            const { audioDataUri } = await textToSpeech({ text });
            setMessages(prev => [...prev, { speaker: 'ai', text, audioUrl: audioDataUri }]);
        } catch (error) {
            console.error("TTS failed:", error);
            setMessages(prev => [...prev, { speaker: 'ai', text, audioUrl: undefined }]);
            toast({ variant: "destructive", title: "Audio Error", description: "Couldn't generate AI voice." });
        } finally {
            setIsAISpeaking(false);
        }
    }, [toast]);

    const handleStartInterview = async () => {
        if (!config.role || !config.level) {
            toast({ variant: 'destructive', title: 'Setup Incomplete', description: 'Please select a role and level.' });
            return;
        }
        setIsLoading(true);
        try {
            const result = await generateCodingQuestions({
                role: config.role,
                level: config.level,
                count: parseInt(config.numQuestions, 10),
            });
            if (result.questions.length > 0) {
                setQuestions(result.questions);
                setStage('intro');
                mediaRecorderRef.current?.start();
                await say(`Hello! Welcome to your coding interview for a ${config.level} ${config.role}. Before we dive into the code, please give me a short introduction about your knowledge in this field.`);
            } else {
                toast({ variant: 'destructive', title: 'Failed to generate questions.' });
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate interview questions.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNextStage = async () => {
        if(isAISpeaking) return;

        if (stage === 'intro') {
            setStage('conceptual');
            setMessages(prev => [...prev, { speaker: 'user', text: '(Explains their background)'}]);
            await say(`Great. Now, let's discuss a concept. ${questions[currentQuestionIndex].question} How would you approach solving this problem?`);
        } else if (stage === 'conceptual') {
            setStage('coding');
            setMessages(prev => [...prev, { speaker: 'user', text: '(Explains their approach)'}]);
            await say(`Interesting. Now please write the code for your solution.`);
        }
    };

    const handleFinishInterview = async () => {
        if (!mediaRecorderRef.current) return;
        
        setStage('processing');
        mediaRecorderRef.current.stop();

        // Wait for onstop to fire
        setTimeout(async () => {
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            if(videoBlob.size === 0) {
                toast({ variant: 'destructive', title: 'Recording Error', description: 'The recording is empty. Please try again.' });
                setStage('setup');
                return;
            }

            setProcessingState({ progress: 10, message: 'Preparing your video...' });
            const reader = new FileReader();
            reader.readAsDataURL(videoBlob);
            reader.onloadend = async () => {
                const videoDataUri = reader.result as string;
                setProcessingState({ progress: 30, message: 'Analyzing your submission...' });
                try {
                    const analysisResult = await analyzeCodingAttempt({
                        videoDataUri,
                        question: questions[currentQuestionIndex].question,
                        code: code,
                        role: config.role,
                        level: config.level,
                    });
                    setProcessingState({ progress: 90, message: 'Finalizing report...' });
                    const videoUrl = URL.createObjectURL(videoBlob);
                    sessionStorage.setItem('videoUrl', videoUrl);
                    sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
                    sessionStorage.setItem('analysisType', 'coding');
                    router.push('/analysis');
                } catch (e) {
                    toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze your submission.' });
                    setStage('error');
                }
            }
        }, 500);
    };
    
    const toggleMic = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
            stream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
            setIsMicOn(!isMicOn);
        }
    };

    const toggleCamera = () => {
        const stream = videoRef.current?.srcObject as MediaStream;
        if (stream) {
            stream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
            setIsCameraOn(!isCameraOn);
        }
    };

    const lastMessage = messages[messages.length - 1];
    
    useEffect(() => {
        if(lastMessage?.speaker === 'ai' && lastMessage.audioUrl && audioRef.current) {
            audioRef.current.src = lastMessage.audioUrl;
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }, [lastMessage]);

    const renderContent = () => {
        if (hasPermission === false) {
            return <div className="flex items-center justify-center h-full"><Alert variant="destructive"><AlertTitle>Permissions Required</AlertTitle><AlertDescription>Please allow camera/mic access.</AlertDescription></Alert></div>;
        }

        switch (stage) {
            case 'setup':
                return <Card className="w-full max-w-lg"><CardHeader><CardTitle>Coding Interview Setup</CardTitle><CardDescription>Configure your technical mock interview.</CardDescription></CardHeader><CardContent className="space-y-4"><Select onValueChange={(v) => setConfig(c => ({...c, role: v}))}><SelectTrigger><SelectValue placeholder="Select a Role" /></SelectTrigger><SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select><Select onValueChange={(v) => setConfig(c => ({...c, level: v}))}><SelectTrigger><SelectValue placeholder="Select a Level" /></SelectTrigger><SelectContent>{levels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent></Select><Button onClick={handleStartInterview} className="w-full" disabled={isLoading}>{isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Starting...</> : 'Start Interview'}</Button></CardContent></Card>;
            case 'intro':
            case 'conceptual':
                return <div className="flex flex-col items-center justify-center h-full text-center p-4"><div className="flex items-center gap-4 my-4">{isAISpeaking && <Volume2 className="h-8 w-8 animate-pulse" />}{lastMessage?.speaker === 'ai' && <h2 className="text-3xl font-bold">"{lastMessage.text}"</h2>}</div><Button onClick={handleNextStage} size="lg" className="mt-6" disabled={isAISpeaking}>I'm ready to answer <Send className="ml-2"/></Button></div>;
            case 'coding':
                return <div className="p-4 h-full flex flex-col"><Card className="flex-grow flex flex-col"><CardHeader><CardTitle>Your Code</CardTitle><CardDescription>Explain your thought process as you code. This will be analyzed.</CardDescription></CardHeader><CardContent className="flex-grow flex flex-col"><Textarea value={code} onChange={e => setCode(e.target.value)} placeholder="Type your code here..." className="flex-grow font-mono text-sm resize-none" /><Button onClick={handleFinishInterview} className="w-full mt-4"><Send className="mr-2"/>Finish & Analyze</Button></CardContent></Card></div>;
            case 'processing':
                return <div className="flex flex-col items-center justify-center h-full text-center p-4"><h2 className="text-2xl font-bold mb-4">{processingState.message}</h2><Progress value={processingState.progress} className="w-full max-w-md"/></div>;
            case 'error':
                 return <div className="flex flex-col items-center justify-center h-full text-center p-4"><h2 className="text-2xl font-bold">Analysis Failed!</h2><p className="text-muted-foreground mt-2 mb-6">Something went wrong. Would you like to retry?</p><Button onClick={() => window.location.reload()} size="lg"><Play className="mr-2"/> Restart Interview</Button></div>;
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="p-4 flex justify-between items-center border-b border-gray-700">
                <Button asChild variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700"><Link href="/interview"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
                <div className="text-lg font-semibold flex items-center gap-2"><Code /> Coding Mock Interview</div>
                <div />
            </header>
            <main className="flex-1 grid md:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="bg-gray-800 rounded-lg flex items-center justify-center relative">
                    {stage === 'coding' ? renderContent() : <div className="flex items-center justify-center h-full">{renderContent()}</div>}
                </div>
                <div className="bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                    <audio ref={audioRef} onEnded={() => setIsAISpeaking(false)} />
                    {hasPermission === false && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                            <Alert variant="destructive"><AlertTitle>Camera Access Required</AlertTitle><AlertDescription>Please allow camera and mic access.</AlertDescription></Alert>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                        <p className="font-semibold">You</p>
                    </div>
                     {(stage !== 'setup' && stage !== 'processing') && (
                        <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full"></div>REC
                        </div>
                    )}
                </div>
            </main>
             <footer className="p-4 flex justify-center items-center space-x-4 bg-gray-900/80 border-t border-gray-700">
                <Button variant={isMicOn ? 'secondary' : 'destructive'} size="icon" className="rounded-full w-14 h-14" onClick={toggleMic} disabled={!hasPermission || stage === 'setup' || stage === 'processing'}><{isMicOn ? 'Mic' : 'MicOff'} className="h-6 w-6" /></Button>
                <Button variant={isCameraOn ? 'secondary' : 'destructive'} size="icon" className="rounded-full w-14 h-14" onClick={toggleCamera} disabled={!hasPermission || stage === 'setup' || stage === 'processing'}><{isCameraOn ? 'Video' : 'VideoOff'} className="h-6 w-6" /></Button>
            </footer>
        </div>
    );
}

export default withAuth(CodingInterviewPage);

    