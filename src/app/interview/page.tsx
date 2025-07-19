'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export default function InterviewPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Toggle camera and mic based on initial state
        stream.getVideoTracks().forEach(track => track.enabled = isCameraOn);
        stream.getAudioTracks().forEach(track => track.enabled = isMicOn);

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Media Access Denied',
          description: 'Please enable camera and microphone permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();
  }, [isCameraOn, isMicOn, toast]);

  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCamera = () => setIsCameraOn(!isCameraOn);

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
        {/* AI Video Feed */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
           <img src="https://placehold.co/800x600/1f2937/ffffff" data-ai-hint="futuristic robot" alt="AI Interviewer" className="w-full h-full object-cover" />
           <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
             <p className="font-semibold">AI Interviewer</p>
           </div>
        </div>

        {/* User Video Feed */}
        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            {hasCameraPermission === false && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                    <Alert variant="destructive" className="max-w-sm">
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera and microphone access to start the interview. Check your browser's site settings.
                      </AlertDescription>
                    </Alert>
                </div>
            )}
             <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-lg">
                <p className="font-semibold">You</p>
            </div>
        </div>
      </main>

      <footer className="p-4 flex justify-center items-center space-x-4 bg-gray-900/80">
        <Button
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={toggleMic}
          disabled={hasCameraPermission === false}
        >
          {isMicOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        <Button
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={toggleCamera}
          disabled={hasCameraPermission === false}
        >
          {isCameraOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </Button>
        <Button asChild variant="destructive" size="icon" className="rounded-full w-16 h-14">
          <Link href="/">
            <PhoneOff className="h-6 w-6" />
          </Link>
        </Button>
      </footer>
    </div>
  );
}
