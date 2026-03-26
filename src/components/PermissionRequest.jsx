'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Camera, Mic, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';






export function PermissionRequest({ onPermissionGranted, onError }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionState, setPermissionState] = useState('initial');
  const [errorMessage, setErrorMessage] = useState('');
  const [autoRequested, setAutoRequested] = useState(false);

  // Auto-request permissions when component mounts (for localhost)
  useEffect(() => {
    if (!autoRequested) {
      setAutoRequested(true);
      // Small delay to let the component render first
      setTimeout(() => {
        requestPermissions();
      }, 500);
    }
  }, [autoRequested]);

  const requestPermissions = async () => {
    setIsRequesting(true);
    setPermissionState('initial');
    setErrorMessage('');

    try {
      console.log('Requesting camera and microphone permissions...');

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia is not supported in this browser');
      }

      // Request media access - this will prompt the browser permission dialog
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user' // Front-facing camera
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        }
      });

      console.log('Media permissions granted successfully');
      console.log('Video tracks:', stream.getVideoTracks().length);
      console.log('Audio tracks:', stream.getAudioTracks().length);

      // Test that we actually got tracks
      if (stream.getVideoTracks().length === 0) {
        throw new Error('No video track available');
      }
      if (stream.getAudioTracks().length === 0) {
        throw new Error('No audio track available');
      }

      onPermissionGranted(stream);

    } catch (error) {
      console.error('Error requesting media permissions:', error);

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setPermissionState('denied');
          setErrorMessage('Camera and microphone access was denied. Please click "Allow" when prompted by your browser.');
        } else if (error.name === 'NotFoundError') {
          setPermissionState('error');
          setErrorMessage('No camera or microphone found. Please connect a device and try again.');
        } else if (error.name === 'NotSupportedError') {
          setPermissionState('error');
          setErrorMessage('Your browser does not support camera/microphone access. Try using Chrome, Firefox, or Edge.');
        } else if (error.name === 'NotReadableError') {
          setPermissionState('error');
          setErrorMessage('Camera or microphone is already in use by another application.');
        } else if (error.name === 'OverconstrainedError') {
          setPermissionState('error');
          setErrorMessage('Camera settings could not be satisfied. Trying with basic settings...');

          // Retry with basic constraints
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            console.log('Basic media permissions granted');
            onPermissionGranted(basicStream);
            setIsRequesting(false);
            return;
          } catch (basicError) {
            console.error('Basic permissions also failed:', basicError);
          }
        } else if (error.name === 'SecurityError') {
          setPermissionState('error');
          setErrorMessage('Security error: Make sure you\'re using HTTPS or localhost. Some browsers block camera access on HTTP sites.');
        } else {
          setPermissionState('error');
          setErrorMessage(`Unexpected error: ${error.message}`);
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

    if (userAgent.includes('chrome') || userAgent.includes('chromium')) {
      instructions = `For Chrome:
1. Click the camera icon in the address bar (left side)
2. Select "Always allow" for camera and microphone
3. Refresh this page
4. OR go to Settings > Privacy and Security > Site Settings > Camera/Microphone`;
    } else if (userAgent.includes('firefox')) {
      instructions = `For Firefox:
1. Click the shield/lock icon in the address bar
2. Click "Allow" for camera and microphone
3. Refresh this page
4. OR go to Preferences > Privacy & Security > Permissions`;
    } else if (userAgent.includes('safari')) {
      instructions = `For Safari:
1. Go to Safari menu > Preferences > Websites
2. Click Camera and Microphone on the left
3. Set permissions to "Allow"
4. Refresh this page`;
    } else if (userAgent.includes('edge')) {
      instructions = `For Edge:
1. Click the lock icon in the address bar
2. Set Camera and Microphone to "Allow"
3. Refresh this page
4. OR go to Settings > Site permissions`;
    } else {
      instructions = `General steps:
1. Look for a camera/microphone icon in your browser's address bar
2. Click it and select "Allow" for both camera and microphone
3. Refresh this page
4. Check your browser's site settings/permissions`;
    }

    alert(instructions);
  };

  const checkCurrentURL = () => {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isHTTPS && !isLocalhost) {
      return {
        isSecure: false,
        message: 'Camera access requires HTTPS or localhost. Please use https:// or access via localhost.'
      };
    }

    return { isSecure: true, message: '' };
  };

  const urlCheck = checkCurrentURL();

  return (
    <div style={{ marginLeft: "auto", marginRight: "auto", display: "flex", height: "100%", maxWidth: "32rem", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <Card style={{ width: "100%" }}>
        <CardHeader style={{ textAlign: "center" }}>
          <div style={{ marginBottom: "1rem", display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative" }}>
              <Camera style={{ height: "3rem", width: "3rem" }} />
              <Mic style={{ position: "absolute", bottom: "-0.25rem", right: "-0.25rem", height: "1.5rem", width: "1.5rem", borderRadius: "9999px", padding: "0.25rem" }} />
            </div>
          </div>
          <CardTitle style={{ fontSize: "1.25rem", lineHeight: "1.75rem" }}>Camera & Microphone Access Required</CardTitle>
          <CardDescription>
            We need access to your camera and microphone to conduct the interview and provide accurate analysis.
          </CardDescription>
        </CardHeader>
        
        <CardContent style={{ marginTop: "calc(1rem * calc(1 - 0))", marginBottom: "calc(1rem * 0)" }}>
          {!urlCheck.isSecure &&
          <Alert variant="destructive" style={{ marginBottom: "1rem" }}>
              <AlertTriangle style={{ height: "1rem", width: "1rem" }} />
              <AlertTitle>Security Issue</AlertTitle>
              <AlertDescription>
                {urlCheck.message}
              </AlertDescription>
            </Alert>
          }

          {permissionState === 'initial' &&
          <div style={{ marginTop: "calc(1rem * calc(1 - 0))", marginBottom: "calc(1rem * 0)", textAlign: "center" }}>
              <p style={{ fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                Your browser should prompt you to allow camera and microphone access. Please click "Allow" when prompted.
              </p>
              
              <div style={{ borderRadius: "0.5rem", borderWidth: "1px", borderColor: "rgb(191,219,254)", backgroundColor: "rgb(239,246,255)", padding: "0.75rem", fontSize: "0.875rem", lineHeight: "1.25rem", color: "rgb(30,64,175)" }}>
                <strong>👆 Look for the permission prompt!</strong><br />
                It usually appears at the top of your browser or in the address bar.
              </div>
              
              <Button
              onClick={requestPermissions}
              disabled={isRequesting}
              style={{ width: "100%" }}
              size="lg">
              
                {isRequesting ?
              <>
                    <RefreshCw style={{ marginRight: "0.5rem", height: "1rem", width: "1rem", animation: "spin 1s linear infinite" }} />
                    Requesting Access...
                  </> :

              <>
                    <Camera style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                    Request Camera & Microphone Access
                  </>
              }
              </Button>

              {isRequesting &&
            <div style={{ textAlign: "center", fontSize: "0.75rem", lineHeight: "1rem" }}>
                  <p>🔍 Check your browser's address bar for permission prompts</p>
                  <p>📱 The prompt might appear at the top of the page</p>
                </div>
            }
            </div>
          }

          {permissionState === 'denied' &&
          <Alert variant="destructive">
              <AlertTriangle style={{ height: "1rem", width: "1rem" }} />
              <AlertTitle>Access Denied</AlertTitle>
              <AlertDescription style={{ marginTop: "calc(0.75rem * calc(1 - 0))", marginBottom: "calc(0.75rem * 0)" }}>
                <p>{errorMessage}</p>
                
                <div style={{ marginTop: "calc(0.5rem * calc(1 - 0))", marginBottom: "calc(0.5rem * 0)" }}>
                  <p style={{ fontWeight: "500" }}>To fix this:</p>
                  <ol style={{ listStylePosition: "inside", listStyleType: "decimal", marginTop: "calc(0.25rem * calc(1 - 0))", marginBottom: "calc(0.25rem * 0)", fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                    <li>Look for a camera 📷 icon in your browser's address bar</li>
                    <li>Click it and select "Always allow" for both camera and microphone</li>
                    <li>Click "Try Again" below</li>
                    <li>If that doesn't work, refresh this page (F5)</li>
                  </ol>
                </div>

                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                  <Button variant="outline" onClick={openBrowserSettings} style={{ flex: "1 1 0%" }}>
                    <ExternalLink style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                    Help Me Fix This
                  </Button>
                  <Button onClick={requestPermissions} style={{ flex: "1 1 0%" }}>
                    <RefreshCw style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                    Try Again
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          }

          {permissionState === 'error' &&
          <Alert variant="destructive">
              <AlertTriangle style={{ height: "1rem", width: "1rem" }} />
              <AlertTitle>Hardware or Browser Error</AlertTitle>
              <AlertDescription style={{ marginTop: "calc(0.75rem * calc(1 - 0))", marginBottom: "calc(0.75rem * 0)" }}>
                <p>{errorMessage}</p>
                
                <div style={{ marginTop: "calc(0.5rem * calc(1 - 0))", marginBottom: "calc(0.5rem * 0)" }}>
                  <p style={{ fontWeight: "500" }}>Please check:</p>
                  <ul style={{ listStylePosition: "inside", listStyleType: "disc", marginTop: "calc(0.25rem * calc(1 - 0))", marginBottom: "calc(0.25rem * 0)", fontSize: "0.875rem", lineHeight: "1.25rem" }}>
                    <li>Your camera and microphone are properly connected</li>
                    <li>No other applications are using your camera (close Zoom, Teams, etc.)</li>
                    <li>Your browser supports media access (use Chrome, Firefox, or Edge)</li>
                    <li>You're using HTTPS or localhost</li>
                    <li>Try restarting your browser</li>
                  </ul>
                </div>

                <Button onClick={requestPermissions} style={{ marginTop: "1rem", width: "100%" }}>
                  <RefreshCw style={{ marginRight: "0.5rem", height: "1rem", width: "1rem" }} />
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          }

          <div style={{ marginTop: "calc(0.25rem * calc(1 - 0))", marginBottom: "calc(0.25rem * 0)", borderTopWidth: "1px", paddingTop: "0.75rem", textAlign: "center", fontSize: "0.75rem", lineHeight: "1rem" }}>
            <p>🔒 Your privacy is protected:</p>
            <p>• Recording stays on your device during the interview</p>
            <p>• Analysis is done securely and temporarily</p>
            <p>• No permanent storage of video data</p>
          </div>
        </CardContent>
      </Card>
    </div>);

}