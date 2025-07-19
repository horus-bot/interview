'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, PhoneOff, Play, Pause, Send, Bot, MicOff, VideoOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { transcribe } from '@/ai/flows/transcribe-flow';
import { reasoningAnalysis } from '@/ai/flows/reasoning-analysis';
import { Progress } from '@/components/ui/progress';
import { withAuth } from '@/context/auth-context';

const interviewQuestions = [
    "Tell me about yourself.",
    "What are your biggest strengths and weaknesses?",
    "Tell me about a time you faced a challenge at work and how you handled it.",
    "Where do you see yourself in 5 years?",
    "Why are you interested in this role?",
];

type InterviewState = 'not_started' | 'in_progress' | 'finished' | 'processing';

function InterviewPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [interviewState, setInterviewState] = useState<InterviewState>('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [processingState, setProcessingState] = useState<{progress: number, message: string}>({progress: 0, message: ''});
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const { toast } = useToast();
  const router = useRouter();

  const handleStartInterview = useCallback(() => {
    if (mediaRecorderRef.current) {
      recordedChunksRef.current = [];
      mediaRecorderRef.current.start();
      setInterviewState('in_progress');
    } else {
        toast({
            variant: 'destructive',
            title: 'Media Recorder not ready',
            description: 'Please ensure camera and microphone permissions are granted.',
        });
    }
  }, [toast]);
  
  const handleStopInterview = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setInterviewState('finished');
    }
  }, []);

  useEffect(() => {
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        stream.getVideoTracks().forEach(track => track.enabled = isCameraOn);
        stream.getAudioTracks().forEach(track => track.enabled = isMicOn);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = async () => {
            setInterviewState('processing');
            const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            const videoUrl = URL.createObjectURL(videoBlob);
            
            setProcessingState({progress: 10, message: 'Converting video to audio for transcription...'});

            const reader = new FileReader();
            reader.readAsDataURL(videoBlob);
            reader.onloadend = async () => {
                const videoDataUri = reader.result as string;
                
                try {
                    setProcessingState({progress: 30, message: 'Transcribing your answers... (this may take a moment)'});
                    const { transcript } = await transcribe({ mediaDataUri: videoDataUri });

                    if(!transcript || transcript.length < 20) {
                         toast({
                            variant: 'destructive',
                            title: 'Transcription Failed',
                            description: 'Could not generate a transcript. The recording might have been too short or silent.',
                        });
                        setInterviewState('finished');
                        return;
                    }

                    setProcessingState({progress: 70, message: 'Analyzing your interview performance...'});
                    const analysisResult = await reasoningAnalysis({ videoDataUri, transcript });

                    setProcessingState({progress: 90, message: 'Finalizing your report...'});
                    sessionStorage.setItem('videoUrl', videoUrl);
                    sessionStorage.setItem('transcript', transcript);
                    sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));

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

      } catch (error) {
        console.error('Error accessing media devices:', error);
        setHasPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };
    setupMedia();
  }, [isCameraOn, isMicOn, toast, router]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleStopInterview();
    }
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

  const renderContent = () => {
    if (hasPermission === false) {
      return (
         <div className="flex flex-col items-center justify-center h-full text-center">
            <Alert variant="destructive" className="max-w-sm">
                <AlertTitle>Media Permissions Required</AlertTitle>
                <AlertDescription>
                Please allow camera and microphone access to start the interview. Check your browser's site settings and refresh the page.
                </AlertDescription>
            </Alert>
         </div>
      );
    }
    
    switch (interviewState) {
        case 'not_started':
            return (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bot className="h-16 w-16 text-primary mb-4"/>
                    <h2 className="text-2xl font-bold">Ready for your Mock Interview?</h2>
                    <p className="text-muted-foreground mt-2 mb-6">You'll be asked {interviewQuestions.length} questions. The session will be recorded and analyzed.</p>
                    <Button onClick={handleStartInterview} size="lg">
                        <Play className="mr-2" /> Start Interview
                    </Button>
                </div>
            );
        case 'in_progress':
            return (
                 <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-black/30 rounded-lg">
                    <p className="text-lg text-muted-foreground">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
                    <h2 className="text-3xl font-bold my-4">"{interviewQuestions[currentQuestionIndex]}"</h2>
                    <Button onClick={handleNextQuestion} size="lg" className="mt-6">
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
                        <Play className="mr-2" /> Restart Interview
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
      <header className="p-4 flex justify-between items-center">
        <Button asChild variant="outline" className="bg-transparent hover:bg-gray-800 border-gray-700">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <div className="text-lg font-semibold">Mock Interview with AI</div>
        <div />
      </header>

      <main className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            {renderContent()}
        </div>

        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                    <Alert variant="destructive" className="max-w-sm">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera and microphone access to start the interview.
                      </AlertDescription>
                    </Alert>
                </div>
            )}
             <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                <p className="font-semibold">You</p>
            </div>
             {interviewState === 'in_progress' && (
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1 rounded-full">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    <span className="font-bold text-sm">REC</span>
                </div>
            )}
        </div>
      </main>

      <footer className="p-4 flex justify-center items-center space-x-4 bg-gray-900/80">
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
            disabled={interviewState !== 'in_progress'}
        >
            <PhoneOff className="h-6 w-6" />
        </Button>
      </footer>
    </div>
  );
}


export default withAuth(InterviewPage);
