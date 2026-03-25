"use client";

import { z } from 'zod';

const TextToSpeechInputSchema = z.object({ text: z.string() });
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({ audioDataUri: z.string(), success: z.boolean() });
export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

// Global reference to prevent Chrome garbage collection bug
let utterances: SpeechSynthesisUtterance[] = [];

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
        resolve({ audioDataUri: "error", success: false });
        return;
    }
    
    // Slight delay to ensure cancel propagation
    window.speechSynthesis.cancel();
    
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(input.text);
        
        // Prevent GC by pushing to global array
        utterances.push(utterance);
        
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google US English")) || 
                               voices.find(v => v.lang === "en-US" && v.name.includes("Female")) || 
                               voices.find(v => v.lang === "en-US") || 
                               voices[0];
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        utterance.onstart = () => resolve({ audioDataUri: "ok", success: true });
        
        utterance.onend = () => {
            // Clean up the retained utterance
            utterances = utterances.filter(u => u !== utterance);
        };
        
        utterance.onerror = (e) => {
            console.error("Speech error processing:", e);
            if (e && e.error) {
              console.error("error type:", e.error);
            }
            
            // Ignore "interrupted" errors which happen on cancel
            if (e && e.error === "interrupted") {
               resolve({ audioDataUri: "ok", success: true });
               return;
            }
            resolve({ audioDataUri: "error", success: false });
            
            // Clean up
            utterances = utterances.filter(u => u !== utterance);
        };
        
        try {
            window.speechSynthesis.speak(utterance);
        } catch (err) {
            console.error("Failed to speak:", err);
            resolve({ audioDataUri: "error", success: false });
        }
        
        // Fallback for missing onstart event
        setTimeout(() => resolve({ audioDataUri: "ok", success: true }), 300);
    }, 50);
  });
}

export function isTTSReady(): boolean { 
    return typeof window !== "undefined" && "speechSynthesis" in window; 
}

export function stopSpeech(): void { 
    if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel(); 
    }
}
