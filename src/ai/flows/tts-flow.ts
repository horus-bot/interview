'use client';

import { z } from 'zod';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe("A placeholder audio data URI since ResponsiveVoice plays directly."),
  success: z.boolean().describe("Whether TTS was successful")
});
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// More robust ResponsiveVoice loading
let isResponsiveVoiceLoaded = false;
let loadingPromise: Promise<void> | null = null;

const loadResponsiveVoice = (): Promise<void> => {
  // Return existing loading promise if already loading
  if (loadingPromise) {
    return loadingPromise;
  }

  // Return resolved promise if already loaded
  if (isResponsiveVoiceLoaded && window.responsiveVoice) {
    return Promise.resolve();
  }

  loadingPromise = new Promise((resolve, reject) => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src*="responsivevoice"]');
    if (existingScript && window.responsiveVoice) {
      isResponsiveVoiceLoaded = true;
      loadingPromise = null;
      resolve();
      return;
    }

    // Remove existing script if it exists but ResponsiveVoice is not available
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.src = 'https://code.responsivevoice.org/responsivevoice.js';
    script.async = true;
    
    const timeoutId = setTimeout(() => {
      script.remove();
      loadingPromise = null;
      reject(new Error('ResponsiveVoice loading timeout'));
    }, 10000); // 10 second timeout

    script.onload = () => {
      clearTimeout(timeoutId);
      // Wait for ResponsiveVoice to fully initialize
      let attempts = 0;
      const checkResponsiveVoice = () => {
        attempts++;
        if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
          isResponsiveVoiceLoaded = true;
          loadingPromise = null;
          console.log('ResponsiveVoice loaded successfully');
          resolve();
        } else if (attempts < 20) { // Try for 2 seconds
          setTimeout(checkResponsiveVoice, 100);
        } else {
          loadingPromise = null;
          reject(new Error('ResponsiveVoice failed to initialize properly'));
        }
      };
      checkResponsiveVoice();
    };

    script.onerror = () => {
      clearTimeout(timeoutId);
      script.remove();
      loadingPromise = null;
      reject(new Error('Failed to load ResponsiveVoice script'));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
};

// Enhanced speech function with better error handling
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  try {
    console.log('Starting TTS for:', input.text.substring(0, 50) + '...');
    
    await loadResponsiveVoice();
    
    if (window.responsiveVoice && typeof window.responsiveVoice.speak === 'function') {
      // Cancel any current speech first
      try {
        if (window.responsiveVoice.isPlaying && window.responsiveVoice.isPlaying()) {
          window.responsiveVoice.cancel();
          // Wait a bit for cancellation to complete
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (cancelError) {
        console.warn('Error canceling previous speech:', cancelError);
      }
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('Speech generation timeout'));
        }, 30000); // 30 second timeout

        try {
          window.responsiveVoice.speak(input.text, "UK English Male", {
            rate: 0.9,
            pitch: 1,
            volume: 1,
            onstart: () => {
              console.log('Speech started successfully');
              clearTimeout(timeoutId);
              resolve({
                audioDataUri: "data:audio/wav;base64,responsivevoice_success",
                success: true
              });
            },
            onend: () => {
              console.log('Speech completed');
            },
            onerror: (error) => {
              console.error("ResponsiveVoice speaking error:", error);
              clearTimeout(timeoutId);
              reject(new Error('ResponsiveVoice speaking failed: ' + error));
            }
          });

          // Fallback resolve in case onstart doesn't fire
          setTimeout(() => {
            if (window.responsiveVoice.isPlaying && window.responsiveVoice.isPlaying()) {
              clearTimeout(timeoutId);
              resolve({
                audioDataUri: "data:audio/wav;base64,responsivevoice_success",
                success: true
              });
            }
          }, 500);

        } catch (speakError) {
          clearTimeout(timeoutId);
          reject(new Error('Error calling ResponsiveVoice speak: ' + speakError));
        }
      });
    } else {
      throw new Error('ResponsiveVoice not properly initialized');
    }
  } catch (error) {
    console.error('TTS failed:', error);
    return {
      audioDataUri: "data:audio/wav;base64,fallback_error",
      success: false
    };
  }
}

// Utility function to check if TTS is ready
export function isTTSReady(): boolean {
  return isResponsiveVoiceLoaded && 
         window.responsiveVoice && 
         typeof window.responsiveVoice.speak === 'function';
}

// Utility function to stop current speech
export function stopSpeech(): void {
  try {
    if (window.responsiveVoice && window.responsiveVoice.cancel) {
      window.responsiveVoice.cancel();
    }
  } catch (error) {
    console.error('Error stopping speech:', error);
  }
}

// Add type declaration for ResponsiveVoice
declare global {
  interface Window {
    responsiveVoice: {
      speak: (text: string, voice: string, options?: {
        rate?: number;
        pitch?: number;
        volume?: number;
        onstart?: () => void;
        onend?: () => void;
        onerror?: (error: any) => void;
      }) => void;
      cancel: () => void;
      isPlaying: () => boolean;
    };
  }
}
