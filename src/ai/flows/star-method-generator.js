'use server';
/**
 * @fileOverview An AI flow to refine a user's story using the STAR method.
 *
 * - starMethodStoryGenerator - A function that takes STAR components and generates a cohesive story.
 * - StarMethodStoryGeneratorInput - The input type for the function.
 * - StarMethodStoryGeneratorOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const StarMethodStoryGeneratorInputSchema = z.object({
  situation: z.string().describe("The situation or context of the story."),
  task: z.string().describe("The task or goal the user was responsible for."),
  action: z.string().describe("The specific actions the user took."),
  result: z.string().describe("The outcome or result of the user's actions.")
});


const StarMethodStoryGeneratorOutputSchema = z.object({
  story: z.string().describe("A well-structured and compelling story combining the STAR elements.")
});


export async function starMethodStoryGenerator(input) {
  return starMethodStoryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'starMethodStoryGeneratorPrompt',
  input: { schema: StarMethodStoryGeneratorInputSchema },
  output: { schema: StarMethodStoryGeneratorOutputSchema },
  prompt: `You are an expert career coach and storyteller. A user has provided the components of a story using the STAR method (Situation, Task, Action, Result). Your task is to combine these components into a single, cohesive, and impactful story that would be effective in a job interview.

Make sure the story flows naturally and highlights the user's skills and accomplishments. Use professional and engaging language.

Here are the user's inputs:

- **Situation:** {{{situation}}}
- **Task:** {{{task}}}
- **Action:** {{{action}}}
- **Result:** {{{result}}}

Now, craft the final story.`
});

const starMethodStoryGeneratorFlow = ai.defineFlow(
  {
    name: 'starMethodStoryGeneratorFlow',
    inputSchema: StarMethodStoryGeneratorInputSchema,
    outputSchema: StarMethodStoryGeneratorOutputSchema
  },
  async (input) => {
    const { output } = await prompt(input);
    return output;
  }
);