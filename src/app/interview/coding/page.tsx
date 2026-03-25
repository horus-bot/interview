'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, Send, Bot, Code, Loader2, Volume2, VolumeX, MicOff, VideoOff, Play, Info, AlertTriangle, Camera, SkipForward } from 'lucide-react';
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
import { AICharacter } from '@/components/AICharacter';

type Stage = 'setup' | 'connecting' | 'intro' | 'conceptual' | 'coding' | 'processing' | 'error';
type InterviewerMessage = { speaker: 'ai' | 'user' | 'system'; text: string; audioUrl?: string };

type BrowserSpeechRecognition = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    start: () => void;
    stop: () => void;
};

type SpeechRecognitionErrorEvent = Event & {
    error: string;
};

type SpeechRecognitionResultItem = {
    transcript: string;
};

type SpeechRecognitionResultLike = {
    isFinal: boolean;
    0: SpeechRecognitionResultItem;
};

type SpeechRecognitionEvent = Event & {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
};

declare global {
    interface Window {
        webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
        SpeechRecognition?: new () => BrowserSpeechRecognition;
    }
}

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
    const [spokenTranscript, setSpokenTranscript] = useState('');
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [isSpeechListening, setIsSpeechListening] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const speechRecognitionRef = useRef<BrowserSpeechRecognition | null>(null);
    const shouldKeepListeningRef = useRef(false);
    const finalizedTranscriptRef = useRef('');
    const transcriptCheckpointRef = useRef(0);

    const { toast } = useToast();
    const router = useRouter();

    const getBestRecorderOptions = useCallback((): MediaRecorderOptions => {
        const preferredTypes = [
            'video/webm;codecs=vp9,opus',
            'video/webm;codecs=vp8,opus',
            'video/webm',
            'video/mp4',
        ];

        const mediaRecorderSupportsType =
            typeof MediaRecorder !== 'undefined' &&
            typeof MediaRecorder.isTypeSupported === 'function';

        if (mediaRecorderSupportsType) {
            const supportedType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
            if (supportedType) {
                return {
                    mimeType: supportedType,
                    videoBitsPerSecond: 1000000,
                    audioBitsPerSecond: 128000,
                };
            }
        }

        return {
            videoBitsPerSecond: 1000000,
            audioBitsPerSecond: 128000,
        };
    }, []);

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

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognitionCtor) {
            setIsSpeechSupported(false);
            return;
        }

        setIsSpeechSupported(true);
        const recognition = new SpeechRecognitionCtor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsSpeechListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let newFinalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                const transcript = result?.[0]?.transcript?.trim();
                if (!transcript) continue;

                if (result.isFinal) {
                    newFinalText += `${transcript} `;
                } else {
                    interimText += `${transcript} `;
                }
            }

            if (newFinalText) {
                finalizedTranscriptRef.current = `${finalizedTranscriptRef.current} ${newFinalText}`.trim();
            }

            setSpokenTranscript(`${finalizedTranscriptRef.current} ${interimText}`.trim());
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            console.warn('Speech recognition error:', event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                toast({
                    variant: 'destructive',
                    title: 'Speech Recognition Blocked',
                    description: 'Browser speech-to-text was denied. Enable microphone permissions to transcribe speech.',
                });
            }
        };

        recognition.onend = () => {
            setIsSpeechListening(false);
            if (shouldKeepListeningRef.current) {
                try {
                    recognition.start();
                } catch {
                    // Ignore start errors if already active
                }
            }
        };

        speechRecognitionRef.current = recognition;

        return () => {
            shouldKeepListeningRef.current = false;
            try {
                recognition.stop();
            } catch {
                // Ignore stop errors on cleanup
            }
        };
    }, [toast]);

    useEffect(() => {
        const shouldListen =
            !!hasPermission &&
            isMicOn &&
            (stage === 'intro' || stage === 'conceptual' || stage === 'coding') &&
            !isAISpeaking;

        shouldKeepListeningRef.current = shouldListen;

        const recognition = speechRecognitionRef.current;
        if (!recognition || !isSpeechSupported) return;

        if (shouldListen && !isSpeechListening) {
            try {
                recognition.start();
            } catch {
                // Ignore start errors if already active
            }
        }

        if (!shouldListen && isSpeechListening) {
            try {
                recognition.stop();
            } catch {
                // Ignore stop errors if already stopped
            }
        }
    }, [hasPermission, isMicOn, isAISpeaking, isSpeechListening, isSpeechSupported, stage]);

    // Keep preview video in sync even when the video element mounts after permission is granted
    useEffect(() => {
        if (videoRef.current && mediaStream) {
            videoRef.current.srcObject = mediaStream;
        }
    }, [mediaStream, hasPermission]);

    // Handle successful permission grant
    const handlePermissionGranted = useCallback((stream: MediaStream) => {
        console.log('Permission granted, setting up media stream');

        if (mediaStream) {
            mediaStream.getTracks().forEach((track) => track.stop());
        }

        setHasPermission(true);
        setMediaStream(stream);
        
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            console.log('Video element srcObject set');
        }

        // Set up MediaRecorder
        try {
            const recorderOptions = getBestRecorderOptions();
            const recorder = new MediaRecorder(stream, recorderOptions);
            
            mediaRecorderRef.current = recorder;
            console.log('MediaRecorder created successfully with type:', recorder.mimeType || 'default');

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
    }, [getBestRecorderOptions, mediaStream, toast]);

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
                    if (window.speechSynthesis && window.speechSynthesis.speaking) {
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
                    if (window.speechSynthesis && window.speechSynthesis.speaking) {
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
        setSpokenTranscript('');
        finalizedTranscriptRef.current = '';
        transcriptCheckpointRef.current = 0;
        
        try {
            const result = await generateCodingQuestions({
                role: config.role,
                level: config.level,
                count: parseInt(config.numQuestions, 10),
                resumeText: ''
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

        const currentTranscript = spokenTranscript.trim();
        const segmentTranscript =
            currentTranscript.length > transcriptCheckpointRef.current
                ? currentTranscript.slice(transcriptCheckpointRef.current).trim()
                : '';
        transcriptCheckpointRef.current = currentTranscript.length;

        if (stage === 'intro') {
            setStage('conceptual');
            setMessages(prev => [...prev, { speaker: 'user', text: segmentTranscript || '(No speech transcript captured for introduction)'}]);
            await say(`Great. Now, let's discuss a concept. ${questions[currentQuestionIndex].question} How would you approach solving this problem?`);
        } else if (stage === 'conceptual') {
            setStage('coding');
            setMessages(prev => [...prev, { speaker: 'user', text: segmentTranscript || '(No speech transcript captured for conceptual explanation)'}]);
            await say(`Interesting. Now please write the code for your solution.`);
        }
    };

    const stopAiAndProceed = useCallback(async () => {
        stopSpeech();
        setIsAISpeaking(false);

        if (stage === 'intro' || stage === 'conceptual') {
            const currentTranscript = spokenTranscript.trim();
            const segmentTranscript =
                currentTranscript.length > transcriptCheckpointRef.current
                    ? currentTranscript.slice(transcriptCheckpointRef.current).trim()
                    : '';
            transcriptCheckpointRef.current = currentTranscript.length;

            if (stage === 'intro') {
                setStage('conceptual');
                setMessages(prev => [...prev, { speaker: 'user', text: segmentTranscript || '(Skipped while AI was speaking)'}]);
                await say(`Great. Now, let's discuss a concept. ${questions[currentQuestionIndex].question} How would you approach solving this problem?`);
            } else {
                setStage('coding');
                setMessages(prev => [...prev, { speaker: 'user', text: segmentTranscript || '(Skipped while AI was speaking)'}]);
                await say(`Interesting. Now please write the code for your solution.`);
            }
        }
    }, [stage, spokenTranscript, say, questions, currentQuestionIndex]);

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
        shouldKeepListeningRef.current = false;
        if (speechRecognitionRef.current) {
            try {
                speechRecognitionRef.current.stop();
            } catch {
                // Ignore stop errors
            }
        }
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

            const recordedMimeType = mediaRecorderRef.current?.mimeType || recordedChunksRef.current[0]?.type || 'video/webm';
            const videoBlob = new Blob(recordedChunksRef.current, { type: recordedMimeType });
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

            try {
                setProcessingState({ progress: 25, message: 'Extracting key frames…' });

                const extractFrameImagesFromBlob = async (blob: Blob, frameCount = 6) => {
                    const url = URL.createObjectURL(blob);
                    const video = document.createElement('video');
                    video.src = url;
                    video.muted = true;
                    video.playsInline = true;

                    const waitFor = (eventName: string) =>
                        new Promise<void>((resolve, reject) => {
                            const onError = () => {
                                cleanup();
                                reject(new Error(`Video failed to load (${eventName}).`));
                            };
                            const onOk = () => {
                                cleanup();
                                resolve();
                            };
                            const cleanup = () => {
                                video.removeEventListener(eventName, onOk);
                                video.removeEventListener('error', onError);
                            };
                            video.addEventListener(eventName, onOk, { once: true });
                            video.addEventListener('error', onError, { once: true });
                        });

                    await waitFor('loadedmetadata');

                    const duration = Number.isFinite(video.duration) ? video.duration : 0;
                    const totalDurationSeconds = Math.max(1, Math.round(duration || 0));
                    const canvas = document.createElement('canvas');
                    canvas.width = video.videoWidth || 640;
                    canvas.height = video.videoHeight || 360;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        URL.revokeObjectURL(url);
                        throw new Error('Canvas context not available.');
                    }

                    const seekTo = (time: number) =>
                        new Promise<void>((resolve, reject) => {
                            const onSeeked = () => {
                                cleanup();
                                resolve();
                            };
                            const onError = () => {
                                cleanup();
                                reject(new Error('Video seek failed.'));
                            };
                            const cleanup = () => {
                                video.removeEventListener('seeked', onSeeked);
                                video.removeEventListener('error', onError);
                            };
                            video.addEventListener('seeked', onSeeked, { once: true });
                            video.addEventListener('error', onError, { once: true });
                            video.currentTime = Math.max(0, Math.min(duration || 0, time));
                        });

                    const framesToGrab = Math.min(10, Math.max(1, frameCount));
                    const frameImages: string[] = [];
                    for (let i = 0; i < framesToGrab; i++) {
                        const t = duration > 0 ? (duration * (i + 1)) / (framesToGrab + 1) : 0;
                        await seekTo(t);
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        frameImages.push(canvas.toDataURL('image/jpeg', 0.85));
                    }

                    URL.revokeObjectURL(url);
                    return { frameImages, totalDurationSeconds };
                };

                const { frameImages, totalDurationSeconds } = await extractFrameImagesFromBlob(videoBlob, 1);

                setProcessingState({ progress: 55, message: 'Analyzing your code and performance…' });
                const analysisResult = await analyzeCodingAttempt({
                    frameImages,
                    totalDurationSeconds,
                    question: questions[currentQuestionIndex].question,
                    code: code,
                    spokenTranscript: finalizedTranscriptRef.current.trim() || spokenTranscript.trim(),
                    role: config.role,
                    level: config.level,
                    resumeText: '',
                });

                setProcessingState({ progress: 90, message: 'Finalizing results…' });
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
                    description: 'Could not analyze your submission.',
                });
                setStage('error');
            }
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
                    <div style={{ maxWidth: '42rem', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '1rem', marginBottom: '1.5rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', border: '1px solid #c7d2fe' }}>
                                <Code style={{ width: '2rem', height: '2rem' }} />
                            </div>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', letterSpacing: '-0.025em', color: '#0f172a', marginBottom: '0.75rem' }}>Coding Interview Setup</h2>
                            <p style={{ color: '#64748b', maxWidth: '28rem', margin: '0 auto' }}>Configure your technical interview parameters to match your career goals.</p>
                            
                            {/* Recording Warning */}
                            <Alert style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: '#fffbeb', borderColor: '#fde68a', color: '#78350f' }}>
                                <AlertTriangle style={{ width: '1rem', height: '1rem', color: '#d97706' }} />
                                <AlertTitle style={{ fontWeight: '600', color: '#92400e' }}>Recording Notice</AlertTitle>
                                <AlertDescription style={{ color: '#b45309', marginTop: '0.25rem', opacity: 0.9 }}>
                                    <strong>You are being recorded and will be judged on your coding and communication.</strong><br />
                                    Please behave professionally during this technical interview.
                                </AlertDescription>
                            </Alert>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                                <Button
                                    variant={audioEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleAudio}
                                    style={{ borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}
                                >
                                    {audioEnabled ? <Volume2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> : <VolumeX style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />}
                                    {audioEnabled ? 'AI Voice ON' : 'AI Voice OFF'}
                                </Button>
                                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#94a3b8' }}>
                                    {ttsReady ? 'TTS Ready' : '(Loading audio...)'}
                                </span>
                            </div>

                            {/* Media Status Indicator */}
                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '1.5rem', padding: '0.625rem 1.25rem', backgroundColor: '#f1f5f9', borderRadius: '9999px', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '9999px', backgroundColor: hasPermission ? '#10b981' : '#f43f5e', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}></div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>Camera & Mic</span>
                                    </div>
                                    <div style={{ width: '1px', height: '1rem', backgroundColor: '#cbd5e1' }}></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '9999px', backgroundColor: mediaRecorderRef.current ? '#10b981' : '#fbbf24', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}></div>
                                        <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155' }}>Recording Ready</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1.5rem', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '1.5rem', borderRadius: '1rem', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', marginBottom: '2rem' }}>
                            <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginLeft: '0.25rem' }}>Role</label>
                                <Select value={config.role} onValueChange={value => setConfig(prev => ({...prev, role: value}))}>
                                    <SelectTrigger style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}><SelectValue placeholder="Select role"/></SelectTrigger>
                                    <SelectContent>
                                        {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginLeft: '0.25rem' }}>Experience Level</label>
                                <Select value={config.level} onValueChange={value => setConfig(prev => ({...prev, level: value}))}>
                                    <SelectTrigger style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}><SelectValue placeholder="Select level"/></SelectTrigger>
                                    <SelectContent>
                                        {levels.map(level => <SelectItem key={level} value={level}>{level}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div style={{ gap: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                                <label style={{ fontSize: '0.875rem', fontWeight: '500', color: '#334155', marginLeft: '0.25rem' }}>Questions</label>
                                <Select value={config.numQuestions} onValueChange={value => setConfig(prev => ({...prev, numQuestions: value}))}>
                                    <SelectTrigger style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}><SelectValue placeholder="Count"/></SelectTrigger>
                                    <SelectContent>
                                        {questionCounts.map(count => <SelectItem key={count} value={count}>{count}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        
                        <Button 
                            onClick={handleStartInterview} 
                            style={{ width: '100%', height: '3.5rem', fontSize: '1rem', fontWeight: '500', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s', backgroundColor: '#4f46e5', color: '#ffffff', opacity: (isLoading || !hasPermission || !mediaRecorderRef.current) ? 0.5 : 1 }} 
                            size="lg" 
                            disabled={isLoading || !hasPermission || !mediaRecorderRef.current}
                        >
                            {isLoading ? (
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <Loader2 style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.75rem' }} /> 
                                    Loading AI Engine...
                                </div>
                            ) : (
                                <>Start Interview session</>
                            )}
                        </Button>
                    </div>
                );

            case 'connecting':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem', textAlign: 'center' }}>
                        <AICharacter isSpeaking={false} />
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.5rem' }}>Connecting to AI Interviewer...</h2>
                            {audioEnabled && <p style={{ color: '#64748b' }}>Please wait while we establish the secure connection.</p>}
                        </div>
                    </div>
                );

            case 'intro':
            case 'conceptual':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '48rem', margin: '0 auto', paddingTop: '2rem', paddingBottom: '2rem' }}>
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', gap: '2rem' }}>
                            <div style={{ padding: '2rem', borderRadius: '1.5rem', transition: 'all 0.5s', backgroundColor: isAISpeaking ? '#eef2ff' : '#f8fafc', transform: isAISpeaking ? 'scale(1.05)' : 'scale(1)' }}>
                                {lastMessage?.speaker === 'ai' && (
                                    <AICharacter isSpeaking={isAISpeaking} />
                                )}

                                {lastMessage?.speaker === 'ai' && (
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '500', lineHeight: '1.625', letterSpacing: '-0.025em', color: isAISpeaking ? '#312e81' : '#334155' }}>
                                        "{lastMessage.text}"
                                    </h2>
                                )}
                            </div>
                        
                            {lastMessage?.speaker === 'ai' && (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => playMessageAudio(lastMessage.text)}
                                        disabled={isAISpeaking || !ttsReady}
                                        style={{ borderRadius: '9999px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                    >
                                        <Volume2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                        {isAISpeaking ? 'Playing...' : 'Play Again'}
                                    </Button>
                                    
                                    <Button
                                        variant={audioEnabled ? "default" : "outline"}
                                        size="lg"
                                        onClick={toggleAudio}
                                        style={{ borderRadius: '9999px', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}
                                    >
                                        {audioEnabled ? <Volume2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> : <VolumeX style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />}
                                        {audioEnabled ? 'Voice ON' : 'Voice OFF'}
                                    </Button>

                                    {isAISpeaking && (
                                        <Button
                                            size="lg"
                                            onClick={stopAiAndProceed}
                                            style={{ borderRadius: '9999px', paddingLeft: '1.5rem', paddingRight: '1.5rem', backgroundColor: '#0f172a', color: '#ffffff' }}
                                        >
                                            <SkipForward style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                            Stop AI & Continue
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                        
                        <div style={{ marginTop: 'auto', paddingTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#eff6ff', color: '#1e40af', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #dbeafe', width: '100%', maxWidth: '36rem' }}>
                                <Info style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0 }} />
                                <p style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                                    {isAISpeaking 
                                        ? "AI is speaking. Please listen carefully..." 
                                        : stage === 'intro' 
                                            ? "Introduce yourself and your experience with this technology. When ready, continue."
                                            : "Explain your approach to solving this problem conceptually. When ready, begin coding."
                                    }
                                </p>
                            </div>

                            <Button 
                                onClick={handleNextStage} 
                                style={{ width: '100%', maxWidth: '28rem', height: '3.5rem', fontSize: '1.125rem', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', transition: 'all 0.2s', backgroundColor: '#0f172a', color: '#ffffff' }}
                                size="lg" 
                                disabled={isAISpeaking}
                            >
                                {stage === 'intro' ? 'Continue to Technical Discussion' : 'Start Coding'}
                            </Button>
                        </div>
                    </div>
                );

            case 'coding':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.5rem' }}>
                        <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: '1rem', border: '1px solid #e2e8f0', flexShrink: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#e0e7ff', color: '#4338ca', fontSize: '0.75rem', fontWeight: 'bold', borderRadius: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Question {currentQuestionIndex + 1}
                                </span>
                                <span style={{ padding: '0.25rem 0.625rem', backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.75rem', fontWeight: '600', borderRadius: '0.5rem' }}>
                                    {questions[currentQuestionIndex].topic}
                                </span>
                            </div>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#0f172a', lineHeight: '1.375' }}>
                                {questions[currentQuestionIndex].question}
                            </h3>
                        </div>
                        
                        <Card style={{ flex: '1', display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', minHeight: '400px' }}>
                            <CardHeader style={{ paddingTop: '1rem', paddingBottom: '1rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <CardTitle style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Code style={{ width: '1.25rem', height: '1.25rem', color: '#6366f1' }} />
                                        Code Editor
                                    </CardTitle>
                                    <CardDescription style={{ marginTop: '0.25rem' }}>Write your solution and talk through your approach</CardDescription>
                                </div>
                                {audioEnabled && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => playMessageAudio("Now please write the code for your solution.")}
                                        disabled={isAISpeaking}
                                        style={{ borderRadius: '9999px' }}
                                    >
                                        <Volume2 style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                        Replay Instruction
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent style={{ flex: '1', padding: '0', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', position: 'relative' }}>
                                <Textarea 
                                    style={{ flex: '1', width: '100%', resize: 'none', border: '0', outline: 'none', borderRadius: '0', backgroundColor: 'transparent', color: '#cbd5e1', fontFamily: 'monospace', padding: '1.5rem', fontSize: '0.875rem', lineHeight: '1.625' }}
                                    value={code} 
                                    onChange={e => setCode(e.target.value)} 
                                    placeholder="// Type your code here...
// Explain your thought process aloud while you type." 
                                />
                                <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem' }}>
                                    <Button 
                                        onClick={handleFinishInterview} 
                                        style={{ height: '3rem', paddingLeft: '1.5rem', paddingRight: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', backgroundColor: '#4f46e5', color: '#ffffff', fontWeight: '500' }}
                                        disabled={!isRecording}
                                    >
                                        <Send style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
                                        {isRecording ? 'Submit & Analyze' : 'Recording Not Active'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'processing':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', maxWidth: '28rem', margin: '0 auto', gap: '2rem' }}>
                        <div style={{ width: '6rem', height: '6rem', marginBottom: '1rem', position: 'relative' }}>
                            <div style={{ position: 'absolute', inset: '0', backgroundColor: '#6366f1', borderRadius: '9999px', filter: 'blur(20px)', opacity: '0.2' }}></div>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: '#ffffff', borderRadius: '1rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: '1px solid #cbd5e1' }}>
                                <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#4f46e5' }} />
                            </div>
                        </div>
                        <div style={{ textAlign: 'center', gap: '1rem', width: '100%' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' }}>{processingState.message}</h2>
                            <p style={{ color: '#64748b' }}>Please keep this window open while we process your interview.</p>
                            <div style={{ gap: '0.5rem', paddingTop: '1rem' }}>
                                <Progress value={processingState.progress} style={{ height: '0.5rem', backgroundColor: '#f1f5f9' }} />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '500', color: '#94a3b8' }}>
                                    <span>Processing</span>
                                    <span>{processingState.progress}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'error':
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '1.5rem' }}>
                        <div style={{ width: '5rem', height: '5rem', backgroundColor: '#ffe4e6', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e11d48', marginBottom: '0.5rem' }}>
                            <AlertTriangle style={{ width: '2.5rem', height: '2.5rem' }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#0f172a', marginBottom: '0.75rem' }}>Analysis Failed</h2>
                            <p style={{ color: '#64748b', maxWidth: '24rem', margin: '0 auto' }}>Something went wrong while processing your interview data. Please try again.</p>
                        </div>
                        <Button 
                            onClick={() => window.location.reload()} 
                            size="lg"
                            style={{ borderRadius: '9999px', marginTop: '1rem' }}
                        >
                            <Play style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} /> Restart Interview
                        </Button>
                    </div>
                );
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', transition: 'background-color 0.3s, color 0.3s' }}>
            <header style={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                <Button asChild variant="ghost" style={{ transition: 'background-color 0.2s' }}>
                    <Link href="/interview" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ArrowLeft style={{ width: '1rem', height: '1rem' }} />Back</Link>
                </Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: '600', fontSize: '1.125rem', letterSpacing: '-0.025em' }}>
                    <div style={{ padding: '0.5rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '0.5rem' }}>
                        <Code style={{ width: '1.25rem', height: '1.25rem' }} /> 
                    </div>
                    Coding Mock Interview
                    {isRecording && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', fontSize: '0.75rem', fontWeight: '500', color: '#dc2626', backgroundColor: '#fee2e2', borderRadius: '9999px', border: '1px solid #fecaca' }}>
                            <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#dc2626', borderRadius: '9999px' }}></div>
                            RECORDING
                        </span>
                    )}
                </div>
                <div style={{ width: '6rem', textAlign: 'right' }}>
                    {/* Placeholder for symmetry */}
                </div>
            </header>
            
            <main style={{ flex: '1', display: 'flex', flexDirection: 'row', padding: '1rem', gap: '1.5rem', maxWidth: '1600px', margin: '0 auto', width: '100%', height: 'calc(100vh - 80px)' }}>
                {/* Left Panel: Content */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ flex: '1', overflowY: 'auto', padding: '1.5rem' }}>
                        {renderContent()}
                    </div>
                </div>

                {/* Right Panel: Video & Status */}
                <div style={{ width: '400px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/9', backgroundColor: '#0f172a', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        {hasPermission ? (
                            <>
                                <video 
                                    ref={videoRef}  
                                    autoPlay 
                                    muted 
                                    playsInline 
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                
                                <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ padding: '0.25rem 0.75rem', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: '9999px', color: '#ffffff', fontSize: '0.75rem', fontWeight: '500', border: '1px solid rgba(255,255,255,0.1)' }}>
                                            You
                                        </div>
                                    </div>
                                    
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <Button 
                                            variant={isMicOn ? 'secondary' : 'destructive'} 
                                            size="icon" 
                                            style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}
                                            onClick={toggleMic} 
                                            disabled={!hasPermission || stage === 'setup' || stage === 'processing'}
                                        >
                                            {isMicOn ? <Mic style={{ width: '1rem', height: '1rem' }} /> : <MicOff style={{ width: '1rem', height: '1rem' }} />}
                                        </Button>
                                        <Button 
                                            variant={isCameraOn ? 'secondary' : 'destructive'} 
                                            size="icon" 
                                            style={{ height: '2.5rem', width: '2.5rem', borderRadius: '9999px', backdropFilter: 'blur(12px)', backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}
                                            onClick={toggleCamera} 
                                            disabled={!hasPermission || stage === 'setup' || stage === 'processing'}
                                        >
                                            {isCameraOn ? <Video style={{ width: '1rem', height: '1rem' }} /> : <VideoOff style={{ width: '1rem', height: '1rem' }} />}
                                        </Button>
                                    </div>
                                </div>
                                
                                {isRecording && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0.75rem', backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderRadius: '9999px', color: '#ffffff', fontSize: '0.75rem', fontWeight: '600', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#ef4444' }}></div>
                                        REC
                                    </div>
                                )}
                                
                                {isRecording && (
                                    <div style={{ position: 'absolute', top: '1rem', left: '1rem', maxWidth: '200px', display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.75rem', backgroundColor: 'rgba(79, 70, 229, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '0.75rem', color: '#ffffff', fontSize: '0.75rem', fontWeight: '500', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', border: '1px solid rgba(129, 140, 248, 0.3)' }}>
                                        <AlertTriangle style={{ width: '1rem', height: '1rem', flexShrink: 0, color: '#c7d2fe' }} />
                                        <div>
                                            <p style={{ fontWeight: '600', marginBottom: '0.125rem' }}>Being Analyzed</p>
                                            <p style={{ color: '#c7d2fe', fontSize: '10px', lineHeight: '1.2', opacity: '0.9' }}>Code & performance review in progress</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#94a3b8', gap: '1rem', backgroundColor: '#f1f5f9' }}>
                                <div style={{ padding: '1rem', backgroundColor: '#ffffff', borderRadius: '9999px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                                    <Camera style={{ width: '2rem', height: '2rem' }} />
                                </div>
                                <p style={{ fontSize: '0.875rem', fontWeight: '500', textAlign: 'center', paddingLeft: '2rem', paddingRight: '2rem' }}>Camera will appear here once permissions are granted</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default withAuth(CodingInterviewPage);
