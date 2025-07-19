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
});
export type ReasoningAnalysisInput = z.infer<typeof ReasoningAnalysisInputSchema>;

export const ReasoningAnalysisOutputSchema = z.object({
  transcript: z
    .string()
    .describe(
      'The full transcript of the interview, with speakers identified (e.g., "Interviewer:", "Interviewee:").'
    ),
  interviewSummary: z.string().describe("A brief, one-paragraph summary of the interview's main topics and context."),
  videoAnalysis: z.object({
      posture: z.string().describe("Detailed feedback on the interviewee's posture throughout the interview."),
      bodyLanguage: z.string().describe("Analysis of body language, including gestures, fidgeting, and overall confidence conveyed."),
      eyeContact: z.string().describe("Feedback on the quality and consistency of eye contact with the camera/interviewer."),
  }),
  vocalAnalysis: z.object({
      clarity: z.string().describe("Feedback on the clarity and articulation of the interviewee's speech."),
      pacing: z.string().describe("Analysis of the speech pace, noting if it was too fast, too slow, or varied appropriately."),
      fillerWordCount: z.number().describe("The total count of identified filler words (e.g., 'um', 'ah', 'like')."),
      unprofessionalWordCount: z.number().describe("Count of any words or phrases deemed unprofessional or overly casual."),
  }),
  contentAnalysis: z.object({
      answerClarity: z.string().describe("Feedback on the clarity, structure (e.g., STAR method), and conciseness of the interviewee's answers."),
      relevance: z.string().describe("Analysis of how relevant and on-topic the answers were to the questions asked."),
      improvementSuggestions: z.string().describe("Specific examples and suggestions on how the interviewee could have formulated better, more impactful answers."),
  }),
  guidance: z.array(z.string()).describe("A list of 3-5 actionable, prioritized recommendations for improvement based on the overall analysis."),
});
export type ReasoningAnalysisOutput = z.infer<typeof ReasoningAnalysisOutputSchema>;

export async function reasoningAnalysis(input: ReasoningAnalysisInput): Promise<ReasoningAnalysisOutput> {
  return reasoningAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasoningAnalysisPrompt',
  input: {schema: ReasoningAnalysisInputSchema},
  output: {schema: ReasoningAnalysisOutputSchema},
  prompt: `You are an expert interview coach providing a detailed analysis of a mock interview video.

First, transcribe the entire video. Enable speaker diarization and label the speakers as "Interviewer" and "Interviewee".

Then, perform a comprehensive analysis of the **Interviewee's** performance, focusing on the following areas. Be critical and provide constructive, specific feedback.

**1. Summary:**
   - Briefly summarize the topics discussed in the interview. What was the context?

**2. Video Analysis:**
   - **Posture:** Analyze their posture. Are they sitting up straight? Are their shoulders back? Do they look engaged or slouched?
   - **Body Language:** Evaluate their gestures, fidgeting, and overall non-verbal cues. Do they appear confident, nervous, or distracted?
   - **Eye Contact:** Assess their eye contact with the camera. Is it steady and confident, or do they frequently look away?

**3. Vocal Analysis:**
   - **Clarity:** How clear and articulate is their speech? Is it mumbled or easy to understand?
   - **Pacing:** Analyze their speaking rate. Is it too rushed, too slow, or well-paced?
   - **Filler Words:** Identify and count the usage of filler words like "um," "uh," "like," "you know," "so," etc.
   - **Unprofessional Words:** Identify and count any overly casual or unprofessional language.

**4. Content Analysis:**
   - **Answer Clarity & Structure:** How well-structured were their answers? Did they follow a clear logical flow, like the STAR method? Were the answers concise or rambling?
   - **Relevance:** Were the answers directly relevant to the questions asked?
   - **Improvement Suggestions:** Provide specific advice on how the content of the answers could be improved. For example, suggest better ways to phrase a response or highlight a key achievement more effectively.

**5. Actionable Guidance:**
   - Based on your full analysis, provide 3-5 specific, prioritized, and actionable recommendations for the interviewee to focus on for their next interview.

Analyze this video:
Video: {{media url=videoDataUri}}

Provide your output in the structured JSON format.`,
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
