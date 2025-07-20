'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, Send, Bot, Code, Loader2, Volume2, VolumeX, MicOff, VideoOff, Play, Info, AlertTriangle, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { withAuth } from '@/context/auth-context';
import { generateCodingQuestions, analyzeCodingAttempt, CodingQuestion } from '@/ai/flows/coding-interview-flow';
import { textToSpeech, stopSpeech, isTTSReady } from '@/ai/flows/tts-flow';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PermissionRequest } from '@/components/PermissionRequest';

type Stage = 'setup' | 'connecting' | 'intro' | 'conceptual' | 'coding' | 'processing' | 'error';
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
    const [audioEnabled, setAudioEnabled] = useState(false);
    const [ttsReady, setTtsReady] = useState(false);
    const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    const { toast } = useToast();
    const router = useRouter();

    // Initialize TTS when component mounts
    useEffect(() => {
        const initTTS = async () => {
            try {
                await textToSpeech({ text: "TTS initialization" });
                setTtsReady(true);
                console.log('TTS initialized successfully');
            } catch (error) {
                console.warn('TTS initialization failed:', error);
                setTtsReady(false);
            }
        };
        
        initTTS();
    }, []);

    // Handle successful permission grant
    const handlePermissionGranted = useCallback((stream: MediaStream) => {
        console.log('Permission granted, setting up media stream');
        setHasPermission(true);
        setMediaStream(stream);
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log('Video element srcObject set');
        }

        // Set up MediaRecorder
        try {
            const recorder = new MediaRecorder(stream, { 
                mimeType: 'video/webm; codecs=vp8,opus',
                videoBitsPerSecond: 1000000,
                audioBitsPerSecond: 128000
            });
            
            mediaRecorderRef.current = recorder;
            console.log('MediaRecorder created successfully');

            recorder.ondataavailable = (event) => {
                console.log('Data available:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            recorder.onstart = () => {
                console.log('Recording started');
                setIsRecording(true);
                recordedChunksRef.current = []; // Clear previous chunks
            };

            recorder.onstop = () => {
                console.log('Recording stopped. Total chunks:', recordedChunksRef.current.length);
                setIsRecording(false);
            };

            recorder.onerror = (event) => {
                console.error('MediaRecorder error:', event);
                toast({
                    variant: 'destructive',
                    title: 'Recording Error',
                    description: 'Failed to record video. Please try again.',
                });
            };

        } catch (error) {
            console.error('Error creating MediaRecorder:', error);
            toast({
                variant: 'destructive',
                title: 'Setup Error',
                description: 'Failed to set up recording. Please refresh and try again.',
            });
        }

        toast({
            title: 'Camera & Microphone Ready',
            description: 'You can now start your coding interview.',
        });
    }, [toast]);

    // Handle permission error
    const handlePermissionError = useCallback((error: string) => {
        console.error('Permission error:', error);
        setHasPermission(false);
    }, []);

    // Cleanup media stream on unmount
    useEffect(() => {
        return () => {
            if (mediaStream) {
                console.log('Cleaning up media stream');
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [mediaStream]);
    
    const say = useCallback(async (text: string) => {
        if (!audioEnabled || !ttsReady) {
            setMessages(prev => [...prev, { speaker: 'ai', text, audioUrl: "silent" }]);
            return;
        }

        setIsAISpeaking(true);
        try {
            const result = await textToSpeech({ text });
            setMessages(prev => [...prev, { speaker: 'ai', text, audioUrl: result.success ? "spoken" : "silent" }]);
            
            if (result.success) {
                const speechTimeout = setTimeout(() => {
                    setIsAISpeaking(false);
                }, Math.max(text.length * 80, 3000));
                
                const checkSpeechEnd = () => {
                    if (window.responsiveVoice && window.responsiveVoice.isPlaying()) {
                        setTimeout(checkSpeechEnd, 500);
                    } else {
                        clearTimeout(speechTimeout);
                        setIsAISpeaking(false);
                    }
                };
                
                setTimeout(checkSpeechEnd, 1000);
            } else {
                throw new Error('TTS failed');
            }
        } catch (error) {
            console.error("TTS failed:", error);
            setMessages(prev => [...prev, { speaker: 'ai', text, audioUrl: "error" }]);
            toast({ variant: "destructive", title: "Audio Error", description: "Couldn't generate AI voice. You can read the text instead." });
            setIsAISpeaking(false);
        }
    }, [audioEnabled, ttsReady, toast]);

    const playMessageAudio = useCallback(async (text: string) => {
        if (!audioEnabled || !ttsReady) {
            toast({
                variant: 'default',
                title: 'Audio Disabled',
                description: 'Click the volume button to enable AI voice.',
            });
            return;
        }

        setIsAISpeaking(true);
        try {
            const result = await textToSpeech({ text });
            
            if (result.success) {
                const speechTimeout = setTimeout(() => {
                    setIsAISpeaking(false);
                }, Math.max(text.length * 80, 3000));
                
                const checkSpeechEnd = () => {
                    if (window.responsiveVoice && window.responsiveVoice.isPlaying()) {
                        setTimeout(checkSpeechEnd, 500);
                    } else {
                        clearTimeout(speechTimeout);
                        setIsAISpeaking(false);
                    }
                };
                
                setTimeout(checkSpeechEnd, 1000);
            } else {
                throw new Error('TTS failed');
            }
        } catch (error) {
            console.error("Audio play failed:", error);
            setIsAISpeaking(false);
            toast({
                variant: 'destructive',
                title: 'Audio Error',
                description: "Couldn't play audio. Please try again.",
            });
        }
    }, [audioEnabled, ttsReady, toast]);

    const toggleAudio = () => {
        if (audioEnabled) {
            stopSpeech();
            setIsAISpeaking(false);
        }
        setAudioEnabled(!audioEnabled);
    };

    const handleStartInterview = async () => {
        if (!config.role || !config.level) {
            toast({ variant: 'destructive', title: 'Setup Incomplete', description: 'Please select a role and level.' });
            return;
        }

        if (!mediaRecorderRef.current) {
            toast({ variant: 'destructive', title: 'Recording Not Ready', description: 'Please ensure camera permissions are granted.' });
            return;
        }

        setIsLoading(true);
        setStage('connecting');
        
        try {
            const result = await generateCodingQuestions({
                role: config.role,
                level: config.level,
                count: parseInt(config.numQuestions, 10),
            });
            
            if (result.questions.length > 0) {
                setQuestions(result.questions);
                setStage('intro');
                
                // Start recording
                console.log('Starting recording...');
                try {
                    mediaRecorderRef.current.start(1000); // Record in 1-second chunks
                    console.log('MediaRecorder.start() called');
                } catch (error) {
                    console.error('Error starting recorder:', error);
                    toast({
                        variant: 'destructive',
                        title: 'Recording Failed',
                        description: 'Could not start recording. Please refresh and try again.',
                    });
                    setStage('setup');
                    setIsLoading(false);
                    return;
                }
                
                await say(`Hello! Welcome to your coding interview for a ${config.level} ${config.role}. Before we dive into the code, please give me a short introduction about your knowledge in this field.`);
            } else {
                toast({ variant: 'destructive', title: 'Failed to generate questions.' });
                setStage('setup');
            }
        } catch (error) {
            console.error('Error in handleStartInterview:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not generate interview questions.' });
            setStage('setup');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleNextStage = async () => {
        if (isAISpeaking) return;

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
        if (!mediaRecorderRef.current || !isRecording) {
            toast({
                variant: 'destructive',
                title: 'Recording Error',
                description: 'No active recording found. Please try again.',
            });
            return;
        }
        
        console.log('Stopping recording...');
        setStage('processing');
        mediaRecorderRef.current.stop();

        // Wait a bit for the onstop event to fire and collect all chunks
        setTimeout(async () => {
            console.log('Processing recorded chunks:', recordedChunksRef.current.length);
            
            if (recordedChunksRef.current.length === 0) {
                console.error('No recorded chunks available');
                toast({ 
                    variant: 'destructive', 
                    title: 'Recording Error', 
                    description: 'No recording data found. Please try again.' 
                });
                setStage('setup');
                return;
            }

            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            console.log('Created video blob, size:', videoBlob.size, 'bytes');
            
            if (videoBlob.size === 0) {
                console.error('Video blob is empty');
                toast({ 
                    variant: 'destructive', 
                    title: 'Recording Error', 
                    description: 'The recording is empty. Please try again.' 
                });
                setStage('setup');
                return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    setProcessingState({ progress: 30, message: 'Analyzing your code and performance...' });
                    const videoDataUri = reader.result as string;
                    console.log('Video data URI created, length:', videoDataUri.length);
                    
                    const analysisResult = await analyzeCodingAttempt({
                        videoDataUri,
                        question: questions[currentQuestionIndex].question,
                        code: code,
                        role: config.role,
                        level: config.level,
                    });

                    setProcessingState({ progress: 90, message: 'Finalizing results...' });
                    const videoUrl = URL.createObjectURL(videoBlob);
                    sessionStorage.setItem('videoUrl', videoUrl);
                    sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
                    sessionStorage.setItem('analysisType', 'coding');

                    setProcessingState({ progress: 100, message: 'Complete!' });
                    router.push('/analysis');
                } catch (error) {
                    console.error('Analysis failed:', error);
                    toast({ 
                        variant: 'destructive', 
                        title: 'Analysis Failed', 
                        description: 'Could not analyze your submission.' 
                    });
                    setStage('error');
                }
            };
            
            reader.onerror = () => {
                console.error('FileReader error');
                toast({ 
                    variant: 'destructive', 
                    title: 'Processing Error', 
                    description: 'Could not process the recording.' 
                });
                setStage('error');
            };
            
            reader.readAsDataURL(videoBlob);
        }, 1000); // Give more time for chunks to be collected
    };

    const toggleMic = () => {
        if (mediaStream) {
            const audioTracks = mediaStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = !isMicOn;
            });
            setIsMicOn(!isMicOn);
            console.log('Microphone toggled:', !isMicOn);
        }
    };

    const toggleCamera = () => {
        if (mediaStream) {
            const videoTracks = mediaStream.getVideoTracks();
            videoTracks.forEach(track => {
                track.enabled = !isCameraOn;
            });
            setIsCameraOn(!isCameraOn);
            console.log('Camera toggled:', !isCameraOn);
        }
    };

    const lastMessage = messages[messages.length - 1];

    const renderContent = () => {
        // Show permission request if no permission
        if (hasPermission === false || hasPermission === null) {
            return (
                <PermissionRequest 
                    onPermissionGranted={handlePermissionGranted}
                    onError={handlePermissionError}
                />
            );
        }

        switch (stage) {
            case 'setup':
                return (
                    <div className="p-6 space-y-6">
                        <div className="text-center">
                            <Code className="h-12 w-12 text-primary mx-auto mb-4"/>
                            <h2 className="text-2xl font-bold">Coding Interview Setup</h2>
                            <p className="text-muted-foreground mt-2">Configure your technical interview</p>
                            
                            {/* Recording Warning */}
                            <Alert className="mt-4 mb-4 border-amber-500 bg-amber-50 text-amber-800">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle className="text-amber-800">Recording Notice</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    <strong>You are being recorded and will be judged on your coding and communication.</strong><br />
                                    Please behave professionally during this technical interview.
                                </AlertDescription>
                            </Alert>

                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Button
                                    variant={audioEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleAudio}
                                    className="flex items-center gap-2"
                                >
                                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                    {audioEnabled ? 'AI Voice ON' : 'AI Voice OFF'}
                                </Button>
                                <span className="text-xs text-muted-foreground">
                                    {ttsReady ? '(Audio ready)' : '(Loading audio...)'}
                                </span>
                            </div>

                            {/* Media Status Indicator */}
                            <div className="text-center mb-4">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className="text-sm">Camera & Mic</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${mediaRecorderRef.current ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                        <span className="text-sm">Recording Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid gap-4">
                            <div>
                                <label className="text-sm font-medium">Role</label>
                                <Select value={config.role} onValueChange={value => setConfig(prev => ({...prev, role: value}))}>
                                    <SelectTrigger><SelectValue placeholder="Select role"/></SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Experience Level</label>
                                <Select value={config.level} onValueChange={value => setConfig(prev => ({...prev, level: value}))}>
                                    <SelectTrigger><SelectValue placeholder="Select level"/></SelectTrigger>
                                    <SelectContent>
                                        {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium">Number of Questions</label>
                                <Select value={config.numQuestions} onValueChange={value => setConfig(prev => ({...prev, numQuestions: value}))}>
                                    <SelectTrigger><SelectValue placeholder="Select count"/></SelectTrigger>
                                    <SelectContent>
                                        {questionCounts.map(count => <SelectItem key={count} value={count}>{count}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleStartInterview} 
                            className="w-full" 
                            size="lg" 
                            disabled={isLoading || !hasPermission || !mediaRecorderRef.current}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 animate-spin"/> 
                                    Generating Questions...
                                </>
                            ) : (
                                <>Start Interview</>
                            )}
                        </Button>
                    </div>
                );

            case 'connecting':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <h2 className="text-2xl font-bold">AI Interviewer is joining...</h2>
                        {audioEnabled && <p className="text-sm text-muted-foreground mt-2">Listen for the introduction...</p>}
                    </div>
                );

            case 'intro':
            case 'conceptual':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="flex items-center gap-4 my-4">
                            {isAISpeaking && <Volume2 className="h-8 w-8 animate-pulse text-primary" />}
                            {lastMessage?.speaker === 'ai' && <h2 className="text-3xl font-bold">"{lastMessage.text}"</h2>}
                        </div>
                        
                        {lastMessage?.speaker === 'ai' && !isAISpeaking && (
                            <div className="flex gap-2 mt-4 mb-6">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => playMessageAudio(lastMessage.text)}
                                    disabled={isAISpeaking || !ttsReady}
                                    className="flex items-center gap-2"
                                >
                                    <Volume2 className="h-4 w-4" />
                                    {isAISpeaking ? 'Playing...' : 'Listen Again'}
                                </Button>
                                
                                <Button
                                    variant={audioEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleAudio}
                                    className="flex items-center gap-2"
                                >
                                    {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                    {audioEnabled ? 'Voice ON' : 'Voice OFF'}
                                </Button>
                            </div>
                        )}
                        
                        <div className="mt-6 bg-primary/20 text-primary-foreground p-4 rounded-lg flex items-center gap-2">
                            <Info className="h-5 w-5" />
                            <p className="font-medium text-sm">
                                {isAISpeaking 
                                    ? "AI is speaking. Listen carefully..." 
                                    : stage === 'intro' 
                                        ? "Introduce yourself and your experience with this technology."
                                        : "Explain your approach to solving this problem conceptually."
                                }
                            </p>
                        </div>
                        
                        <Button onClick={handleNextStage} className="mt-6" size="lg" disabled={isAISpeaking}>
                            {stage === 'intro' ? 'Continue to Technical Discussion' : 'Start Coding'}
                        </Button>
                    </div>
                );

            case 'coding':
                return (
                    <div className="p-4 h-full flex flex-col">
                        <div className="mb-4 bg-primary/20 text-primary-foreground p-3 rounded-lg">
                            <h3 className="font-semibold text-lg">{questions[currentQuestionIndex].question}</h3>
                            <p className="text-sm mt-1 opacity-90">Topic: {questions[currentQuestionIndex].topic}</p>
                        </div>
                        
                        <Card className="flex-grow flex flex-col">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg flex items-center justify-between">
                                    Code Editor
                                    {audioEnabled && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => playMessageAudio("Now please write the code for your solution.")}
                                            disabled={isAISpeaking}
                                            className="flex items-center gap-2"
                                        >
                                            <Volume2 className="h-4 w-4" />
                                            Replay Instruction
                                        </Button>
                                    )}
                                </CardTitle>
                                <CardDescription>Write your solution below and explain your approach</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow flex flex-col">
                                <Textarea 
                                    value={code} 
                                    onChange={e => setCode(e.target.value)} 
                                    placeholder="Type your code here..." 
                                    className="flex-grow font-mono text-sm resize-none" 
                                />
                                <Button 
                                    onClick={handleFinishInterview} 
                                    className="w-full mt-4"
                                    disabled={!isRecording}
                                >
                                    <Send className="mr-2"/>
                                    {isRecording ? 'Finish & Analyze' : 'Recording Not Active'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'processing':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h2 className="text-2xl font-bold mb-4">{processingState.message}</h2>
                        <Progress value={processingState.progress} className="w-full max-w-md"/>
                    </div>
                );

            case 'error':
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <h2 className="text-2xl font-bold">Analysis Failed!</h2>
                        <p className="text-muted-foreground mt-2 mb-6">Something went wrong. Would you like to retry?</p>
                        <Button onClick={() => window.location.reload()} size="lg">
                            <Play className="mr-2"/> Restart Interview
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white">
            <header className="p-4 flex justify-between items-center border-b border-gray-700">
                <Button asChild variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
                    <Link href="/interview"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link>
                </Button>
                <div className="text-lg font-semibold flex items-center gap-2">
                    <Code /> 
                    Coding Mock Interview
                    {isRecording && (
                        <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
                            RECORDING
                        </span>
                    )}
                </div>
                <div />
            </header>
            
            <main className="flex-1 grid md:grid-cols-2 gap-4 p-4 overflow-hidden">
                <div className="bg-gray-800 rounded-lg flex items-center justify-center relative">
                    <div className="flex items-center justify-center h-full w-full">{renderContent()}</div>
                </div>
                <div className="bg-gray-800 rounded-lg relative overflow-hidden flex items-center justify-center">
                    {hasPermission ? (
                        <>
                            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                            
                            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                                <p className="font-semibold">You</p>
                            </div>
                            
                            {isRecording && (
                                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    REC
                                </div>
                            )}
                            
                            {isRecording && (
                                <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-2 rounded-lg">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <AlertTriangle className="h-4 w-4" />
                                        Being Analyzed
                                    </div>
                                    <p className="text-xs mt-1">Code & performance review</p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                            <Camera className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-gray-400">Camera will appear here once permissions are granted</p>
                        </div>
                    )}
                </div>
            </main>
            
            <footer className="p-4 flex justify-center items-center space-x-4 bg-gray-900/80 border-t border-gray-700">
                <Button 
                    variant={isMicOn ? 'secondary' : 'destructive'} 
                    size="icon" 
                    className="rounded-full w-14 h-14" 
                    onClick={toggleMic} 
                    disabled={!hasPermission || stage === 'setup' || stage === 'processing'}
                >
                    {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>
                <Button 
                    variant={isCameraOn ? 'secondary' : 'destructive'} 
                    size="icon" 
                    className="rounded-full w-14 h-14" 
                    onClick={toggleCamera} 
                    disabled={!hasPermission || stage === 'setup' || stage === 'processing'}
                >
                    {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
                </Button>
            </footer>
        </div>
    );
}

export default withAuth(CodingInterviewPage);
