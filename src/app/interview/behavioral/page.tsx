'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, PhoneOff, Send, Bot, MicOff, VideoOff, Volume2, VolumeX, Loader2, Info, AlertTriangle, Camera } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { reasoningAnalysis } from '@/ai/flows/reasoning-analysis';
import { Progress } from '@/components/ui/progress';
import { withAuth } from '@/context/auth-context';
import { textToSpeech, stopSpeech, isTTSReady } from '@/ai/flows/tts-flow';
import { PermissionRequest } from '@/components/PermissionRequest';

const interviewQuestions = [
    "Tell me about yourself.",
    "What are your biggest strengths and weaknesses?",
    "Tell me about a time you faced a challenge at work and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this role?",
];

type InterviewState = 'not_started' | 'in_progress' | 'finished' | 'processing';

function BehavioralInterviewPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [processingState, setProcessingState] = useState<{progress: number, message: string}>({progress: 0, message: ''});
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
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
    setHasPermission(true);
    setMediaStream(stream);
    
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const recorder = new MediaRecorder(stream, { 
      mimeType: 'video/webm; codecs=vp8,opus',
      videoBitsPerSecond: 1000000, // 1Mbps for good quality
      audioBitsPerSecond: 128000   // 128kbps for audio
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
        setInterviewState('processing');
        const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        
        if (videoBlob.size === 0) {
            toast({
                variant: 'destructive',
                title: 'Recording Error',
                description: 'The recording is empty. Please try again.',
            });
            setInterviewState('finished');
            return;
        }
        
        setProcessingState({progress: 10, message: 'Analyzing your interview performance...'});

        const reader = new FileReader();
        reader.readAsDataURL(videoBlob);
        reader.onloadend = async () => {
            const videoDataUri = reader.result as string;
            
            try {
                setProcessingState({progress: 50, message: 'AI is reviewing your responses...'});
                const analysisResult = await reasoningAnalysis({ videoDataUri });

                if(!analysisResult?.transcript || analysisResult.transcript.length < 10) {
                     toast({
                        variant: 'destructive',
                        title: 'Analysis Failed',
                        description: 'Could not generate a transcript. The recording might have been too short or silent.',
                    });
                    setInterviewState('finished');
                    return;
                }

                setProcessingState({progress: 90, message: 'Finalizing your report...'});
                const videoUrl = URL.createObjectURL(videoBlob);
                sessionStorage.setItem('videoUrl', videoUrl);
                sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
                sessionStorage.setItem('analysisType', 'behavioral');

                setProcessingState({progress: 100, message: 'Redirecting to analysis...'});
                router.push('/analysis');

            } catch (error) {
                console.error("Processing failed:", error);
                toast({
                    variant: 'destructive',
                    title: 'Analysis Failed',
                    description: 'An error occurred during processing. Please try again.',
                });
                setInterviewState('finished');
            }
        };
    };

    toast({
      title: 'Camera & Microphone Ready',
      description: 'You can now start your interview.',
    });
  }, [toast, router]);

  // Handle permission error
  const handlePermissionError = useCallback((error: string) => {
    setHasPermission(false);
    console.error('Permission error:', error);
  }, []);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mediaStream]);

  const handleStartInterview = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start(1000); // Record in 1-second chunks
      setInterviewState('in_progress');
      setIsConnecting(true);
      
      toast({
        title: 'Interview Started',
        description: 'You are now being recorded. Good luck!',
      });
    } else {
        toast({
            variant: 'destructive',
            title: 'Media Recorder not ready',
            description: 'Please ensure camera and microphone permissions are granted.',
        });
    }
  }, [toast]);
  
  const handleStopInterview = useCallback(() => {
    stopSpeech();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setInterviewState('finished');
    }
  }, []);

  // Enhanced audio play function with user control
  const playQuestionAudio = useCallback(async () => {
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
      const result = await textToSpeech({ text: interviewQuestions[currentQuestionIndex] });
      
      if (result.success) {
        const speechTimeout = setTimeout(() => {
          setIsAISpeaking(false);
          setIsConnecting(false);
        }, Math.max(interviewQuestions[currentQuestionIndex].length * 80, 3000));
        
        const checkSpeechEnd = () => {
          if (window.responsiveVoice && window.responsiveVoice.isPlaying()) {
            setTimeout(checkSpeechEnd, 500);
          } else {
            clearTimeout(speechTimeout);
            setIsAISpeaking(false);
            setIsConnecting(false);
          }
        };
        
        setTimeout(checkSpeechEnd, 1000);
      } else {
        throw new Error('TTS failed to generate speech');
      }
      
    } catch (error) {
      console.error("Audio play failed:", error);
      setIsAISpeaking(false);
      setIsConnecting(false);
      toast({
        variant: 'destructive',
        title: 'Audio Error',
        description: "Couldn't generate AI voice. You can read the question instead.",
      });
    }
  }, [audioEnabled, ttsReady, currentQuestionIndex, toast]);

  // Auto-play when interview starts (only if audio enabled)
  useEffect(() => {
    if (interviewState === 'in_progress' && isConnecting) {
      if (audioEnabled) {
        playQuestionAudio();
      } else {
        setTimeout(() => setIsConnecting(false), 1000);
      }
    }
  }, [interviewState, isConnecting, audioEnabled, playQuestionAudio]);

  const handleNextQuestion = () => {
    stopSpeech();
    setAudioUrl(null);
    setIsAISpeaking(false);
    
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleStopInterview();
    }
  };

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
      setIsAISpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  const toggleMic = () => {
    if (mediaStream) {
        mediaStream.getAudioTracks().forEach(track => track.enabled = !isMicOn);
        setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
        mediaStream.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
        setIsCameraOn(!isCameraOn);
    }
  };

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
    
    switch (interviewState) {
        case 'not_started':
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bot className="h-16 w-16 text-primary mb-4"/>
                    <h2 className="text-2xl font-bold">Ready for your Behavioral Interview?</h2>
                    <p className="text-muted-foreground mt-2 mb-4">You'll be asked {interviewQuestions.length} common behavioral questions.</p>
                    
                    {/* Recording Warning */}
                    <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="text-amber-800">Recording Notice</AlertTitle>
                        <AlertDescription className="text-amber-700">
                            <strong>You are being recorded and will be judged on your performance.</strong><br />
                            Please behave professionally as this interview will be analyzed by AI.
                        </AlertDescription>
                    </Alert>

                    <div className="flex items-center gap-2 mb-6">
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

                    <Button onClick={handleStartInterview} size="lg" disabled={!hasPermission}>
                        Start Interview
                    </Button>
                </div>
            );
        case 'in_progress':
             if (isConnecting) {
                return (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
                        <h2 className="text-2xl font-bold">AI is joining the interview...</h2>
                        {audioEnabled && <p className="text-sm text-muted-foreground mt-2">Listen for the question...</p>}
                    </div>
                );
            }
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-black/30 rounded-lg">
                    <p className="text-lg text-muted-foreground">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
                    <div className="flex items-center gap-4 my-4">
                        {isAISpeaking && <Volume2 className="h-8 w-8 animate-pulse text-primary" />}
                        <h2 className="text-3xl font-bold">"{interviewQuestions[currentQuestionIndex]}"</h2>
                    </div>
                    
                    <div className="flex gap-2 mt-4 mb-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={playQuestionAudio}
                            disabled={isAISpeaking || !ttsReady}
                            className="flex items-center gap-2"
                        >
                            <Volume2 className="h-4 w-4" />
                            {isAISpeaking ? 'Playing...' : 'Listen to Question'}
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

                    <div className="mt-4 bg-primary/20 text-primary-foreground p-3 rounded-lg flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        <p className="font-medium text-sm">
                            {isAISpeaking ? "AI is speaking the question..." : "Answer the question thoroughly, then click Next."}
                        </p>
                    </div>
                    
                    <Button onClick={handleNextQuestion} size="lg" className="mt-6" disabled={isAISpeaking}>
                        {currentQuestionIndex < interviewQuestions.length - 1 ? (
                            <>Next Question <Send className="ml-2"/></>
                        ) : (
                            <>Finish & Analyze <Send className="ml-2"/></>
                        )}
                    </Button>
                </div>
            );
        case 'finished':
             return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <h2 className="text-2xl font-bold">Interview Finished!</h2>
                    <p className="text-muted-foreground mt-2 mb-6">Something went wrong during processing. Would you like to retry?</p>
                    <Button onClick={() => window.location.reload()} size="lg">
                        Restart Interview
                    </Button>
                </div>
            );
        case 'processing':
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <h2 className="text-2xl font-bold mb-4">{processingState.message}</h2>
                    <Progress value={processingState.progress} className="w-full max-w-md"/>
                </div>
            )
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      <header className="p-4 flex justify-between items-center border-b border-gray-700">
        <Button asChild variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
          <Link href="/interview">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Interview Types
          </Link>
        </Button>
        <div className="text-lg font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5" />
          Behavioral Mock Interview
          {interviewState === 'in_progress' && (
            <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-bold animate-pulse">
              RECORDING
            </span>
          )}
        </div>
        <div />
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {renderContent()}
        </div>

        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {hasPermission ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                {audioUrl && <audio ref={audioRef} src={audioUrl} autoPlay onEnded={() => setAudioUrl(null)}/>}
                
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                    <p className="font-semibold">You</p>
                </div>
                
                {interviewState === 'in_progress' && !isConnecting && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        REC
                    </div>
                )}
                
                {interviewState === 'in_progress' && (
                    <div className="absolute top-4 left-4 bg-red-600/90 text-white px-3 py-2 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="h-4 w-4" />
                            Being Analyzed
                        </div>
                        <p className="text-xs mt-1">AI is judging your performance</p>
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
          disabled={!hasPermission || interviewState !== 'in_progress'}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={toggleCamera}
          disabled={!hasPermission || interviewState !== 'in_progress'}
        >
          {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        <Button 
            onClick={handleStopInterview}
            variant="destructive"
            size="icon"
            className="rounded-full w-16 h-14"
            disabled={interviewState !== 'in_progress' || isConnecting}
        >
            <PhoneOff className="h-6 w-6" />
        </Button>
      </footer>
    </div>
  );
}

export default withAuth(BehavioralInterviewPage);
