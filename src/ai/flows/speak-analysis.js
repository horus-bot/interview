'use server';
/**
 * @fileOverview An AI flow to analyze speaking skills from an audio recording.
 *
 * - speakAnalysis - A function that handles the speaking analysis process.
 * - SpeakAnalysisInput - The input type for the speakAnalysis function.
 * - SpeakAnalysisOutput - The return type for the speakAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SpeakAnalysisInputSchema = z.object({
  audioDataUri: z.
  string().
  describe(
    "An audio recording of a user's speech, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  )
});


const SpeakAnalysisOutputSchema = z.object({
  clarity: z.string().describe("Feedback on the clarity and articulation of the user's speech."),
  pacing: z.string().describe("Feedback on the pacing of the speech (e.g., too fast, too slow, just right)."),
  fillerWords: z.string().describe("Feedback on the use of filler words like 'um', 'ah', 'like', and suggestions for improvement.")
});


export async function speakAnalysis(input) {
  return speakAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'speakAnalysisPrompt',
  input: { schema: SpeakAnalysisInputSchema },
  output: { schema: SpeakAnalysisOutputSchema },
  prompt: `You are an expert interview and speech coach. Analyze the following audio recording of a person answering an interview question.

Provide concise, constructive feedback on the following aspects:
1.  **Clarity:** How clear and articulate was the speech? Was it easy to understand?
2.  **Pacing:** Was the pace of speaking appropriate? Was it too fast, too slow, or well-paced?
3.  **Filler Words:** Identify the usage of filler words (e.g., "um," "ah," "like," "you know"). Provide a brief comment on their usage.

Analyze the audio provided.

Audio: {{media url=audioDataUri}}`
});

const speakAnalysisFlow = ai.defineFlow(
  {
    name: 'speakAnalysisFlow',
    inputSchema: SpeakAnalysisInputSchema,
    outputSchema: SpeakAnalysisOutputSchema
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);