"use client";

import { z } from 'zod';

const TextToSpeechInputSchema = z.object({ text: z.string() });


const TextToSpeechOutputSchema = z.object({ audioDataUri: z.string(), success: z.boolean() });


// Global reference to prevent Chrome garbage collection bug
let utterances = [];

export async function textToSpeech(input) {
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
      const preferredVoice = voices.find((v) => v.name.includes("Google US English")) ||
      voices.find((v) => v.lang === "en-US" && v.name.includes("Female")) ||
      voices.find((v) => v.lang === "en-US") ||
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
        utterances = utterances.filter((u) => u !== utterance);
      };

      utterance.onerror = (e) => {
        // Swallow speech errors in console unless they are not 'interrupted' or 'canceled'
        // This prevents cluttering the Next.js error overlay with expected behavior
        const isExpectedInterruption = e && (e.error === "interrupted" || e.error === "canceled");

        if (!isExpectedInterruption) {
          console.error("Speech Synthesis Error:", e);
        }

        // Still resolve to prevent hanging promises
        resolve({ audioDataUri: e.error || "error", success: isExpectedInterruption });

        // Clean up
        utterances = utterances.filter((u) => u !== utterance);
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        resolve({ audioDataUri: "error", success: false });
      }

      // Fallback for missing onstart event
      setTimeout(() => resolve({ audioDataUri: "ok", success: true }), 300);
    }, 50);
  });
}

export function isTTSReady() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function stopSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}