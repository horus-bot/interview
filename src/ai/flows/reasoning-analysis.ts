'use server';

/**
 * @fileOverview Implements the Reasoning Analysis flow to analyze interview videos and provide summarized, prioritized feedback points.
 *
 * - reasoningAnalysis - A function that handles the reasoning analysis process.
 * - ReasoningAnalysisInput - The input type for the reasoningAnalysis function.
 * - ReasoningAnalysisOutput - The return type for the reasoningAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasoningAnalysisInputSchema = z.object({
  videoDataUri: z
    .string()
    .describe(
      "The interview video, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  transcript: z.string().describe('The transcript of the interview video.'),
});
export type ReasoningAnalysisInput = z.infer<typeof ReasoningAnalysisInputSchema>;

const ReasoningAnalysisOutputSchema = z.object({
  feedbackPoints: z
    .array(z.string())
    .describe('Summarized and prioritized feedback points from the interview.'),
});
export type ReasoningAnalysisOutput = z.infer<typeof ReasoningAnalysisOutputSchema>;

export async function reasoningAnalysis(input: ReasoningAnalysisInput): Promise<ReasoningAnalysisOutput> {
  return reasoningAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningAnalysisPrompt',
  input: {schema: ReasoningAnalysisInputSchema},
  output: {schema: ReasoningAnalysisOutputSchema},
  prompt: `You are an expert interview coach. Analyze the following interview transcript and video to provide summarized and prioritized feedback points to help the interviewee improve their performance.

Consider the clarity of their answers, their body language, and their use of filler words.

Prioritize the most important areas for improvement.

Video: {{media url=videoDataUri}}
Transcript: {{{transcript}}}

Feedback Points:`,
});

const reasoningAnalysisFlow = ai.defineFlow(
  {
    name: 'reasoningAnalysisFlow',
    inputSchema: ReasoningAnalysisInputSchema,
    outputSchema: ReasoningAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
