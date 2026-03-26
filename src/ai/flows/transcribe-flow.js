'use server';

/**
 * @fileOverview An AI flow to transcribe audio from a media file.
 *
 * - transcribe - A function that handles the transcription process.
 * - TranscribeInput - The input type for the transcribe function.
 * - TranscribeOutput - The return type for the transcribe function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranscribeInputSchema = z.object({
  mediaDataUri: z.
  string().
  describe(
    "A media file (audio or video) to be transcribed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  )
});


const TranscribeOutputSchema = z.object({
  transcript: z.string().describe("The full transcribed text from the media file.")
});


export async function transcribe(input) {
  return transcribeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'transcribePrompt',
  input: { schema: TranscribeInputSchema },
  output: { schema: TranscribeOutputSchema },
  prompt: `Transcribe the audio from the following media file.

Media: {{media url=mediaDataUri}}`
});

const transcribeFlow = ai.defineFlow(
  {
    name: 'transcribeFlow',
    inputSchema: TranscribeInputSchema,
    outputSchema: TranscribeOutputSchema
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);