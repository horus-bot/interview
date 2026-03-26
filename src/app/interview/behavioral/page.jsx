'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mic, Video, PhoneOff, Send, Bot, MicOff, VideoOff, Volume2, VolumeX, Loader2, Info, AlertTriangle, Camera, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

import { reasoningAnalysis } from '@/ai/flows/reasoning-analysis';
import { Progress } from '@/components/ui/progress';
import { withAuth } from '@/context/auth-context';
import { textToSpeech, stopSpeech } from '@/ai/flows/tts-flow';
import { PermissionRequest } from '@/components/PermissionRequest';
import { AICharacter } from '@/components/AICharacter';

const interviewQuestions = [
"Tell me about yourself.",
"What are your biggest strengths and weaknesses?",
"Tell me about a time you faced a challenge at work and how you handled it.",
"Where do you see yourself in 5 years?",
"Why are you interested in this role?"];

function BehavioralInterviewPage() {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [hasPermission, setHasPermission] = useState(null);
  const [interviewState, setInterviewState] = useState('not_started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [processingState, setProcessingState] = useState({ progress: 0, message: '' });
  const [audioUrl, setAudioUrl] = useState(null);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [ttsReady, setTtsReady] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);

  const videoRef = useRef(null);
  const headerVideoRef = useRef(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const isAbortedRef = useRef(false);
  const recognitionRef = useRef(null);

  const [liveTranscript, setLiveTranscript] = useState('');
  const interviewStateRef = useRef(interviewState);

  useEffect(() => {
    interviewStateRef.current = interviewState;
  }, [interviewState]);

  const { toast } = useToast();
  const router = useRouter();

  // Effect to handle the header preview video srcObject
  useEffect(() => {
    if (headerVideoRef.current && mediaStream) {
      headerVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

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
  const handlePermissionGranted = useCallback((stream) => {
    setHasPermission(true);
    setMediaStream(stream);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }

    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm; codecs=vp8,opus',
      videoBitsPerSecond: 1000000, // 1Mbps for good quality
      audioBitsPerSecond: 128000 // 128kbps for audio
    });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      if (isAbortedRef.current) return;
      setInterviewState('processing');
      const videoBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });

      if (videoBlob.size === 0) {
        toast({
          variant: 'destructive',
          title: 'Recording Error',
          description: 'The recording is empty. Please try again.'
        });
        setInterviewState('finished');
        return;
      }

      setProcessingState({ progress: 10, message: 'Analyzing your interview performance...' });

      const reader = new FileReader();
      reader.readAsDataURL(videoBlob);
      reader.onloadend = async () => {
        const videoDataUri = reader.result;

        try {
          setProcessingState({ progress: 50, message: 'AI is reviewing your responses...' });
          const analysisResult = await reasoningAnalysis({ videoDataUri });

          if (!analysisResult?.transcript || analysisResult.transcript.length < 10) {
            toast({
              variant: 'destructive',
              title: 'Analysis Failed',
              description: 'Could not generate a transcript. The recording might have been too short or silent.'
            });
            setInterviewState('finished');
            return;
          }

          setProcessingState({ progress: 90, message: 'Finalizing your report...' });
          const videoUrl = URL.createObjectURL(videoBlob);
          sessionStorage.setItem('videoUrl', videoUrl);
          sessionStorage.setItem('analysisResult', JSON.stringify(analysisResult));
          sessionStorage.setItem('analysisType', 'behavioral');

          setProcessingState({ progress: 100, message: 'Redirecting to analysis...' });
          router.push('/analysis');

        } catch (error) {
          console.error("Processing failed:", error);
          toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'An error occurred during processing. Please try again.'
          });
          setInterviewState('finished');
        }
      };
    };

    toast({
      title: 'Camera & Microphone Ready',
      description: 'You can now start your interview.'
    });
  }, [toast, router]);

  // Handle permission error
  const handlePermissionError = useCallback((error) => {
    setHasPermission(false);
    console.error('Permission error:', error);
  }, []);

  // Cleanup media stream on unmount
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
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
        description: 'You are now being recorded. Good luck!'
      });

      // Browser Speech Recognition for Live Transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setLiveTranscript(currentTranscript);
        };

        recognition.onend = () => {
          if (interviewStateRef.current === 'in_progress' && !isAbortedRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
        try { recognition.start(); } catch (e) {}
      }

    } else {
      toast({
        variant: 'destructive',
        title: 'Media Recorder not ready',
        description: 'Please ensure camera and microphone permissions are granted.'
      });
    }
  }, [toast]);

  const handleStopInterview = useCallback(() => {
    stopSpeech();
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setInterviewState('finished');
    }
  }, []);

  const handleAbortInterview = useCallback(() => {
    isAbortedRef.current = true;
    stopSpeech();
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    router.push('/my-analyses');
  }, [router]);

  // Enhanced audio play function with user control
  const playQuestionAudio = useCallback(async () => {
    if (!audioEnabled || !ttsReady) {
      toast({
        variant: 'default',
        title: 'Audio Disabled',
        description: 'Click the volume button to enable AI voice.'
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
          if (window.speechSynthesis && window.speechSynthesis.speaking) {
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
        description: "Couldn't generate AI voice. You can read the question instead."
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

  const toggleAudio = () => {
    if (audioEnabled) {
      stopSpeech();
      setIsAISpeaking(false);
    }
    setAudioEnabled(!audioEnabled);
  };

  const handleNextQuestion = () => {
    stopSpeech();
    setAudioUrl(null);
    setIsAISpeaking(false);
    setLiveTranscript('');

    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleStopInterview();
    }
  };

  const toggleMic = () => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach((track) => track.enabled = !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const toggleCamera = () => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach((track) => track.enabled = !isCameraOn);
      setIsCameraOn(!isCameraOn);
    }
  };

  const renderContent = () => {
    if (hasPermission === false || hasPermission === null) {
      return (
        <div style={{ display: "flex", minHeight: "400px", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "2rem", boxShadow: "0 4px 20px 0 rgba(0,0,0,0.5)" }}>
          <PermissionRequest
            onPermissionGranted={handlePermissionGranted}
            onError={handlePermissionError} />
        </div>);
    }

    switch (interviewState) {
      case 'not_started':
        return (
          <div style={{ marginLeft: "auto", marginRight: "auto", display: "flex", maxWidth: "42rem", flexDirection: "column", gap: "1.5rem", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "2rem", boxShadow: "0 4px 20px 0 rgba(0,0,0,0.5)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ borderRadius: "1rem", padding: "0.75rem", backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
                            <Bot style={{ height: "2rem", width: "2rem" }} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: "1.5rem", lineHeight: "2rem", fontWeight: "700", letterSpacing: "-0.025em", color: '#F8FAFC' }}>Behavioral Interview</h2>
                            <p style={{ fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.025em", color: '#94A3B8' }}>5 Questions • ~10 Minutes</p>
                        </div>
                    </div>
                    
                    <div style={{ display: "flex", gap: "0.75rem", borderRadius: "1rem", borderWidth: "1px", borderColor: "rgba(245, 158, 11, 0.5)", backgroundColor: "rgba(245, 158, 11, 0.1)", padding: "1rem", fontSize: "0.875rem", lineHeight: "1.625", fontStyle: "italic", color: "#FBBF24", boxShadow: "0 0 #0000, 0 0 #0000, 0 1px 2px 0 rgb(0,0,0,0.05)" }}>
                        <Info style={{ height: "1.25rem", width: "1.25rem", flexShrink: "0", color: "#F59E0B" }} />
                        <p>
                            You'll be asked common behavioral questions. Your responses are recorded and analyzed to provide feedback on communication and STAR method application.
                        </p>
                    </div>

                    <div style={{ marginTop: "calc(1rem * calc(1 - 0))", marginBottom: "calc(1rem * 0)", paddingTop: "0.5rem", paddingBottom: "0.5rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "1rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#1E293B", padding: "1rem" }}>
                             <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "#F8FAFC" }}>
                                {audioEnabled ? <Volume2 style={{ height: "1.25rem", width: "1.25rem", color: '#10B981' }} /> : <VolumeX style={{ height: "1.25rem", width: "1.25rem", color: "#94A3B8" }} />}
                                <span style={{ fontWeight: "600" }}>{audioEnabled ? 'Voice Guidance On' : 'Voice Guidance Off'}</span>
                             </div>
                             <Button
                  variant={audioEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={toggleAudio}
                  style={{ borderRadius: "0.75rem", paddingLeft: "1rem", paddingRight: "1rem", backgroundColor: audioEnabled ? '#10B981' : 'transparent', color: audioEnabled ? '#020617' : '#F8FAFC', borderColor: '#334155' }}>
                  
                                {audioEnabled ? 'Disable' : 'Enable'}
                            </Button>
                        </div>
                        {!ttsReady &&
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: '#94A3B8' }}>
                                <Loader2 style={{ height: "0.75rem", width: "0.75rem", animation: "spin 1s linear infinite" }} />
                                Initializing AI Voice...
                            </div>
              }
                    </div>

                    <Button onClick={handleStartInterview} size="lg" style={{ width: "100%", borderRadius: "1rem", paddingTop: "1rem", paddingBottom: "1rem", fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: "700", backgroundColor: '#10B981', color: '#020617', boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms" }} disabled={!hasPermission}>
                        Start Interview
                    </Button>
                </div>);

      case 'in_progress':
        if (isConnecting) {
          return (
            <div style={{ marginLeft: "auto", marginRight: "auto", display: "flex", maxWidth: "28rem", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "3rem", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", transitionDuration: "300ms", color: '#F8FAFC' }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <Loader2 style={{ height: "3rem", width: "3rem", animation: "spin 1s linear infinite", color: '#10B981' }} />
                        </div>
                        <h2 style={{ fontSize: "1.25rem", lineHeight: "1.75rem", fontWeight: "700" }}>Connecting to AI Mentor...</h2>
                        <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", lineHeight: "1.25rem", fontStyle: "italic", color: '#94A3B8' }}>Setting up your private session</p>
                    </div>);

        }
        return (
          <div style={{ position: "relative", marginLeft: "auto", marginRight: "auto", display: "flex", maxWidth: "48rem", flexDirection: "column", gap: "1.5rem", overflow: "hidden", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", color: '#F8FAFC' }}>
                    <div style={{ position: "absolute", left: "0px", top: "0px", height: "0.25rem", width: "100%", backgroundColor: "#1E293B" }}>
                        <div style={{ height: "100%", backgroundColor: '#10B981', transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "700ms", width: `${(currentQuestionIndex + 1) / interviewQuestions.length * 100}%` }} />
                    </div>

                    <div style={{ marginBottom: "0.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ borderRadius: "9999px", borderWidth: "1px", borderColor: '#334155', backgroundColor: '#1E293B', paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.375rem", paddingBottom: "0.375rem", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                        </span>
                        {isAISpeaking &&
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", borderRadius: "9999px", paddingLeft: "0.75rem", paddingRight: "0.75rem", paddingTop: "0.25rem", paddingBottom: "0.25rem", backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10B981' }}>
                                <span style={{ height: "0.75rem", width: "0.25rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", borderRadius: "9999px" }}></span>
                                <span style={{ marginLeft: "0.25rem", fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em" }}>AI Speaking</span>
                             </div>
              }
                    </div>

                    <div style={{ display: "flex", minHeight: "140px", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingLeft: "1rem", paddingRight: "1rem" }}>
                        <AICharacter isSpeaking={isAISpeaking} />
                        <h2 style={{ textAlign: "center", fontSize: "1.875rem", lineHeight: "1.2", fontWeight: "800", fontStyle: "italic", letterSpacing: "-0.025em", color: isAISpeaking ? "#10B981" : "#F8FAFC", marginTop: '1rem', transition: 'color 0.3s ease' }}>
                            "{interviewQuestions[currentQuestionIndex]}"
                        </h2>
                    </div>
                    
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.75rem", borderTopWidth: "1px", borderBottomWidth: "1px", borderColor: "#334155", paddingTop: "1rem", paddingBottom: "1rem" }}>
                        <Button
                variant="outline"
                onClick={playQuestionAudio}
                disabled={isAISpeaking || !ttsReady}
                style={{ display: "flex", height: "3rem", gap: "0.5rem", borderRadius: "0.75rem", fontSize: "0.75rem", lineHeight: "1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", borderColor: '#334155', color: '#F8FAFC', backgroundColor: 'transparent' }}>
                
                            <Volume2 style={{ height: "1rem", width: "1rem" }} />
                            Repeat Question
                        </Button>
                        
                        <Button
                variant={audioEnabled ? "secondary" : "ghost"}
                onClick={toggleAudio}
                style={{ display: "flex", height: "3rem", gap: "0.5rem", borderRadius: "0.75rem", fontSize: "0.75rem", lineHeight: "1rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", backgroundColor: audioEnabled ? '#1E293B' : 'transparent', color: '#F8FAFC' }}>
                
                            {audioEnabled ? <Volume2 style={{ height: "1rem", width: "1rem", color: '#10B981' }} /> : <VolumeX style={{ height: "1rem", width: "1rem" }} />}
                            AI Voice {audioEnabled ? 'ON' : 'OFF'}
                        </Button>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", borderRadius: "1rem", borderWidth: "1px", borderColor: "#334155", backgroundColor: "#1E293B", padding: "1rem" }}>
                        <div style={{ borderRadius: "0.75rem", backgroundColor: "rgba(16, 185, 129, 0.2)", padding: "0.5rem", color: '#10B981' }}>
                            <Sparkles style={{ height: "1.25rem", width: "1.25rem" }} />
                        </div>
                        <p style={{ fontSize: "0.75rem", lineHeight: "1.625", fontWeight: "500", color: "#94A3B8" }}>
                            {isAISpeaking ? "Listening to the question..." : "When you are finished answering, please click 'Next Question' to proceed with the video recording."}
                        </p>
                    </div>
                    
                    <Button
              onClick={handleNextQuestion}
              size="lg"
              disabled={isAISpeaking}
              style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", gap: "0.75rem", borderRadius: "1rem", paddingTop: "1.25rem", paddingBottom: "1.25rem", fontSize: "1.125rem", lineHeight: "1.75rem", fontWeight: "700", backgroundColor: "#10B981", color: "#020617", border: '1px solid #10B981', transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms" }}>
              
                        {currentQuestionIndex < interviewQuestions.length - 1 ?
              <>Next Question <Send style={{ height: "1.25rem", width: "1.25rem" }} /></> :

              <span style={{ color: '#020617', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>Over Interview & Analyze <Sparkles style={{ height: "1.25rem", width: "1.25rem" }} /></span>
              }
                    </Button>
                </div>);

      case 'finished':
        return (
          <div style={{ marginLeft: "auto", marginRight: "auto", display: "flex", maxWidth: "28rem", flexDirection: "column", alignItems: "center", justifyContent: "center", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "rgba(15,23,42,0.8)", padding: "3rem", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", backdropFilter: "blur(12px)", color: '#F8FAFC' }}>
                    <div style={{ marginBottom: "1.5rem", borderRadius: "9999px", backgroundColor: "#1E293B", padding: "1rem" }}>
                        <Bot style={{ height: "3rem", width: "3rem", color: "#94A3B8" }} />
                    </div>
                    <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", lineHeight: "2rem", fontWeight: "700" }}>Interview Finished!</h2>
                    <p style={{ marginBottom: "2rem", color: '#94A3B8' }}>Something went wrong during processing. Would you like to retry?</p>
                    <Button onClick={() => window.location.reload()} size="lg" style={{ borderRadius: "1rem", paddingLeft: "2rem", paddingRight: "2rem", backgroundColor: '#F8FAFC', color: '#020617' }}>
                        Restart Interview
                    </Button>
                </div>);

      case 'processing':
        return (
          <div style={{ marginLeft: "auto", marginRight: "auto", display: "flex", maxWidth: "32rem", flexDirection: "column", gap: "2rem", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "3rem", textAlign: "center", boxShadow: "0 25px 50px rgba(0,0,0,0.5)", transitionDuration: "500ms", color: '#F8FAFC' }}>
                    <div style={{ position: "relative", marginLeft: "auto", marginRight: "auto", height: "8rem", width: "8rem" }}>
                        <div style={{ position: "absolute", inset: "0px", borderRadius: "9999px", borderWidth: "4px", borderColor: "#1E293B" }}></div>
                        <div style={{ position: "absolute", inset: "0px", animation: "spin 1s linear infinite", borderRadius: "9999px", borderWidth: "4px", borderTopColor: "transparent" }}></div>
                        <div style={{ position: "absolute", inset: "0px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Sparkles style={{ height: "2.5rem", width: "2.5rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", color: '#10B981' }} />
                        </div>
                    </div>
                    <div>
                        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem", lineHeight: "2rem", fontWeight: "700" }}>{processingState.message}</h2>
                        <p style={{ color: '#94A3B8' }}>Our AI models are carefully evaluating your body language, tone, and content quality.</p>
                    </div>
                    <div style={{ marginTop: "calc(1rem * calc(1 - 0))", marginBottom: "calc(1rem * 0)" }}>
                        <div style={{ marginBottom: "0.25rem", display: "flex", justifyContent: "space-between", fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: "700" }}>
                            <span>Analysis Progress</span>
                            <span>{processingState.progress}%</span>
                        </div>
                        <Progress value={processingState.progress} style={{ height: "0.75rem", borderRadius: "9999px", backgroundColor: '#1E293B' }} />
                    </div>
                </div>);

    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", backgroundColor: "#020617", color: "#F8FAFC", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      {/* Dynamic Background Elements */}
      <div style={{ pointerEvents: "none", position: "fixed", inset: "0px", zIndex: "0", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: "-10%", top: "-10%", height: "40%", width: "40%", borderRadius: "9999px", filter: "blur(120px)" }}></div>
          <div style={{ position: "absolute", right: "-10%", bottom: "0%", height: "50%", width: "50%", borderRadius: "9999px", backgroundColor: "rgba(16, 185, 129, 0.05)", filter: "blur(150px)" }}></div>
      </div>

      <header style={{ position: "sticky", top: "0px", zIndex: "50", display: "flex", height: "5rem", alignItems: "center", justifyContent: "space-between", borderBottomWidth: "1px", borderColor: '#334155', backgroundColor: "rgba(2, 6, 23, 0.8)", paddingLeft: "1.5rem", paddingRight: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.5)", backdropFilter: "blur(24px)" }}>
        <Button asChild variant="ghost" style={{ borderRadius: "0.75rem", backgroundColor: "transparent", border: '1px solid #334155' }}>
          <Link href="/my-analyses" style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: '#F8FAFC' }}>
            <ArrowLeft style={{ height: "1rem", width: "1rem" }} />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Dashboard</span>
          </Link>
        </Button>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", height: "2.5rem", width: "2.5rem", alignItems: "center", justifyContent: "center", borderRadius: "0.75rem", backgroundColor: "#1E293B" }}>
             <Bot style={{ height: "1.5rem", width: "1.5rem", color: "#10B981" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
              <h1 style={{ fontSize: "0.875rem", lineHeight: "1", fontWeight: "700" }}>Behavioral Mock Interview</h1>
              {interviewState === 'in_progress' ?
            <div style={{ marginTop: "0.25rem", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{ height: "0.5rem", width: "0.5rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", borderRadius: "9999px", backgroundColor: "rgb(239,68,68)" }}></div>
                    <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgb(239,68,68)" }}>Live Recording</span>
                </div> :

            <span style={{ marginTop: "0.25rem", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em", color: '#94A3B8' }}>AI Session</span>
            }
          </div>
        </div>
        <div style={{ display: "flex", height: "2.5rem", width: "2.5rem", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: "9999px", borderWidth: "1px", borderColor: "#334155", backgroundColor: "#1E293B", padding: "0.5rem", boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.5)" }}>
             {mediaStream ?
          <video ref={headerVideoRef} autoPlay muted playsInline style={{ height: "100%", width: "100%", transform: "scaleX(1.5) scaleY(1.5)", borderRadius: "9999px", objectFit: "cover" }} /> :

          <Bot style={{ color: "#94A3B8" }} />
          }
        </div>
      </header>

      <main style={{ width: "100%", display: "flex", flexDirection: "row", gap: "2rem", padding: "2rem", paddingBottom: "10rem", maxWidth: "1600px", margin: "0 auto", height: "calc(100vh - 5rem)", overflowY: "auto" }}>
        {/* Left Side: AI Animation and Controller */}
        <div style={{ flex: "1", display: "flex", flexDirection: "column", justifyContent: "flex-start" }}>
            {renderContent()}
        </div>

        {/* Right Side: User Camera View */}
        <div style={{ width: "450px", flexShrink: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ position: "relative", aspectRatio: "16/9", overflow: "hidden", borderRadius: "1.5rem", borderWidth: "1px", borderColor: "#334155", backgroundColor: "#0F172A", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms" }}>
                {hasPermission ?
            <>
                    <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                style={{ height: "100%", width: "100%", objectFit: "cover" }} />
              
                    {audioUrl && <audio ref={audioRef} src={audioUrl} autoPlay onEnded={() => setAudioUrl(null)} />}
                    
                    <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.75rem", borderWidth: "1px", borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(0,0,0,0.4)", paddingLeft: "0.75rem", paddingRight: "0.75rem", paddingTop: "0.375rem", paddingBottom: "0.375rem", backdropFilter: "blur(12px)", zIndex: 10 }}>
                        <div style={{ height: "0.5rem", width: "0.5rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", borderRadius: "9999px", backgroundColor: "rgb(74,222,128)", boxShadow: "0 0 10px rgba(72,222,128,0.5)" }}></div>
                        <p style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "rgb(255,255,255)" }}>Candidate View</p>
                    </div>
                    
                    {liveTranscript && interviewState === 'in_progress' && (
                        <div style={{ position: "absolute", bottom: "4.5rem", left: "1.5rem", right: "1.5rem", display: "flex", justifyContent: "flex-start", zIndex: 10 }}>
                            <div style={{ backgroundColor: "rgba(15,23,42,0.75)", backdropFilter: "blur(8px)", padding: "1rem", borderRadius: "1rem", color: "#F8FAFC", fontSize: "0.875rem", lineHeight: "1.5", border: "1px solid rgba(255,255,255,0.1)", maxWidth: "90%" }}>
                                <i>"{liveTranscript}"</i>
                            </div>
                        </div>
                    )}
                    
                    {interviewState === 'in_progress' && !isConnecting &&
              <div style={{ position: "absolute", right: "1.5rem", top: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem", borderRadius: "0.75rem", backgroundColor: "rgb(239,68,68)", paddingLeft: "1rem", paddingRight: "1rem", paddingTop: "0.375rem", paddingBottom: "0.375rem", fontSize: "10px", fontWeight: "900", letterSpacing: "0.1em", color: "rgb(255,255,255)", boxShadow: "0 4px 6px rgba(0,0,0,0.5)", transitionDuration: "300ms" }}>
                             <div style={{ height: "0.5rem", width: "0.5rem", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", borderRadius: "9999px", backgroundColor: "rgb(255,255,255)" }}></div>
                             REC
                        </div>
              }
                    
                    {interviewState === 'in_progress' &&
              <div style={{ pointerEvents: "none", position: "absolute", inset: "0px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", boxShadow: "0 0 0 0px #fff,   0 0 0 calc(2px + 0px) rgba(16, 185, 129, 0.2), 0 0 #0000" }}></div>
              }
                  </> :

            <div style={{ display: "flex", height: "100%", width: "100%", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", backgroundColor: "#1E293B", color: "#94A3B8" }}>
                    <div style={{ borderRadius: "9999px", borderWidth: "1px", borderColor: "#334155", backgroundColor: "#0F172A", padding: "1.5rem", boxShadow: "inset 0 2px 4px 0 rgba(0,0,0,0.5)" }}>
                        <Camera style={{ height: "3rem", width: "3rem", color: "#4F46E5" }} />
                    </div>
                    <p style={{ paddingLeft: "3rem", paddingRight: "3rem", textAlign: "center", fontSize: "0.875rem", lineHeight: "1.25rem", fontWeight: "500", opacity: "0.6" }}>Readying your workspace...</p>
                  </div>
            }
            </div>

            {interviewState === 'in_progress' &&
          <div style={{ marginTop: "1.5rem", borderRadius: "1.5rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "#0F172A", padding: "1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", transitionDuration: "500ms" }}>
                    <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ borderRadius: "0.75rem", backgroundColor: "rgba(16, 185, 129, 0.2)", padding: "0.5rem" }}>
                            <Sparkles style={{ height: "1.25rem", width: "1.25rem", color: "#10B981" }} />
                        </div>
                        <h4 style={{ fontWeight: "700", color: '#F8FAFC' }}>Real-time Analysis active</h4>
                    </div>
                    <p style={{ fontSize: "0.75rem", lineHeight: "1.625", color: "#94A3B8" }}>
                        Our behavioral engine is currently monitoring your eye contact, hand gestures, and tone consistency. Stay focused and natural.
                    </p>
                </div>
          }
        </div>
      </main>

      <footer style={{ position: "fixed", bottom: "2rem", left: "50%", zIndex: "50", display: "flex", transform: "translate(-50%, 0)", alignItems: "center", gap: "1rem", borderRadius: "1rem", borderWidth: "1px", borderColor: '#334155', backgroundColor: "rgba(15,23,42,0.8)", padding: "0.75rem", boxShadow: "0 10px 30px rgba(0,0,0,0.5)", backdropFilter: "blur(40px)", transitionDuration: "700ms" }}>
        <Button
          variant={isMicOn ? 'secondary' : 'destructive'}
          size="icon"
          style={{ height: "3.5rem", width: "3.5rem", borderRadius: "0.75rem", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", backgroundColor: isMicOn ? '#1E293B' : 'rgb(220,38,38)', border: isMicOn ? '1px solid #334155' : 'none' }}
          onClick={toggleMic}
          disabled={!hasPermission || interviewState !== 'in_progress'}>
          
          {isMicOn ? <Mic style={{ height: "1.5rem", width: "1.5rem", color: "#F8FAFC" }} /> : <MicOff style={{ height: "1.5rem", width: "1.5rem", color: '#F8FAFC' }} />}
        </Button>
        <Button
          variant={isCameraOn ? 'secondary' : 'destructive'}
          size="icon"
          style={{ height: "3.5rem", width: "3.5rem", borderRadius: "0.75rem", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", backgroundColor: isCameraOn ? '#1E293B' : 'rgb(220,38,38)', border: isCameraOn ? '1px solid #334155' : 'none' }}
          onClick={toggleCamera}
          disabled={!hasPermission || interviewState !== 'in_progress'}>
          
          {isCameraOn ? <Video style={{ height: "1.5rem", width: "1.5rem", color: "#F8FAFC" }} /> : <VideoOff style={{ height: "1.5rem", width: "1.5rem", color: '#F8FAFC' }} />}
        </Button>
        <div style={{ marginLeft: "0.5rem", marginRight: "0.5rem", height: "2rem", width: "1px", backgroundColor: "#334155" }}></div>
        <Button
          onClick={handleAbortInterview}
          variant="outline"
          size="lg"
          style={{ display: "flex", height: "3.5rem", alignItems: "center", gap: "0.75rem", borderRadius: "0.75rem", paddingLeft: "1.5rem", paddingRight: "1.5rem", fontWeight: "700", transitionProperty: "all", transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)", transitionDuration: "150ms", backgroundColor: "transparent", color: '#94A3B8', border: '1px solid #334155' }}
          disabled={interviewState !== 'in_progress' || isConnecting}>
          
            <PhoneOff style={{ height: "1.25rem", width: "1.25rem", color: '#EF4444' }} />
            <span>Abort Session</span>
        </Button>
      </footer>
    </div>);

}

export default withAuth(BehavioralInterviewPage);