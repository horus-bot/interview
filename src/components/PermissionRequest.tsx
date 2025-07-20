'use client';

import { useState } from 'react';
import { AlertTriangle, Camera, Mic, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PermissionRequestProps {
  onPermissionGranted: (stream: MediaStream) => void;
  onError?: (error: string) => void;
}

export function PermissionRequest({ onPermissionGranted, onError }: PermissionRequestProps) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState<'initial' | 'denied' | 'error'>('initial');
  const [errorMessage, setErrorMessage] = useState('');

  const requestPermissions = async () => {
    setIsRequesting(true);
    setPermissionState('initial');
    setErrorMessage('');

    try {
      // First check if permissions are already granted
      const permissions = await navigator.permissions.query({ name: 'camera' as PermissionName });
      const micPermissions = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      
      if (permissions.state === 'denied' || micPermissions.state === 'denied') {
        setPermissionState('denied');
        setErrorMessage('Camera or microphone access has been permanently denied. Please check your browser settings.');
        onError?.('Permissions denied in browser settings');
        setIsRequesting(false);
        return;
      }

      // Request media access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      console.log('Media permissions granted successfully');
      onPermissionGranted(stream);
      
    } catch (error) {
      console.error('Error requesting media permissions:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionState('denied');
          setErrorMessage('Camera and microphone access was denied. Please allow access to continue with the interview.');
        } else if (error.name === 'NotFoundError') {
          setPermissionState('error');
          setErrorMessage('No camera or microphone found. Please connect a device and try again.');
        } else if (error.name === 'NotSupportedError') {
          setPermissionState('error');
          setErrorMessage('Your browser does not support the required media features.');
        } else {
          setPermissionState('error');
          setErrorMessage('An unexpected error occurred while accessing media devices.');
        }
      } else {
        setPermissionState('error');
        setErrorMessage('Failed to access camera and microphone.');
      }
      
      onError?.(errorMessage || 'Permission request failed');
    } finally {
      setIsRequesting(false);
    }
  };

  const openBrowserSettings = () => {
    // Instructions for different browsers
    const userAgent = navigator.userAgent.toLowerCase();
    let instructions = '';
    
    if (userAgent.includes('chrome')) {
      instructions = 'Click the camera icon in the address bar, or go to Settings > Privacy and Security > Site Settings > Camera/Microphone';
    } else if (userAgent.includes('firefox')) {
      instructions = 'Click the shield icon in the address bar, or go to Preferences > Privacy & Security > Permissions';
    } else if (userAgent.includes('safari')) {
      instructions = 'Go to Safari > Preferences > Websites > Camera/Microphone';
    } else if (userAgent.includes('edge')) {
      instructions = 'Click the lock icon in the address bar, or go to Settings > Site permissions';
    } else {
      instructions = 'Check your browser settings for camera and microphone permissions';
    }

    alert(`To enable camera and microphone:\n\n${instructions}\n\nThen refresh this page and try again.`);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 max-w-lg mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Camera className="h-12 w-12 text-primary" />
              <Mic className="h-6 w-6 text-primary absolute -bottom-1 -right-1 bg-background rounded-full p-1" />
            </div>
          </div>
          <CardTitle className="text-xl">Camera & Microphone Access Required</CardTitle>
          <CardDescription>
            We need access to your camera and microphone to conduct the interview and provide accurate analysis.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {permissionState === 'initial' && (
            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Your interview will be recorded and analyzed for feedback. Please ensure you're in a quiet environment with good lighting.
              </p>
              
              <Button 
                onClick={requestPermissions} 
                disabled={isRequesting}
                className="w-full"
                size="lg"
              >
                {isRequesting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Requesting Access...
                  </>
                ) : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Allow Camera & Microphone
                  </>
                )}
              </Button>
            </div>
          )}

          {permissionState === 'denied' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>{errorMessage}</p>
                
                <div className="space-y-2">
                  <p className="font-medium">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Look for a camera/microphone icon in your browser's address bar</li>
                    <li>Click it and select "Allow" for both camera and microphone</li>
                    <li>Or check your browser's site settings</li>
                    <li>Refresh this page after changing settings</li>
                  </ol>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={openBrowserSettings} className="flex-1">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Browser Settings Help
                  </Button>
                  <Button onClick={requestPermissions} className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {permissionState === 'error' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Hardware Error</AlertTitle>
              <AlertDescription className="mt-2 space-y-3">
                <p>{errorMessage}</p>
                
                <div className="space-y-2">
                  <p className="font-medium">Please check:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Your camera and microphone are properly connected</li>
                    <li>No other applications are using your camera</li>
                    <li>Your browser supports media access</li>
                    <li>You're using HTTPS (required for media access)</li>
                  </ul>
                </div>

                <Button onClick={requestPermissions} className="w-full mt-4">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>🔒 Your privacy is protected:</p>
            <p>• Recording stays on your device during the interview</p>
            <p>• Analysis is done securely and temporarily</p>
            <p>• No permanent storage of video data</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}