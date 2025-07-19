
'use server';
/**
 * @fileOverview Implements AI flows for conducting and analyzing coding interviews.
 *
 * - generateCodingQuestions: Creates relevant coding questions based on role and level.
 * - analyzeCodingAttempt: Provides a deep analysis of a user's code, explanation, and on-camera performance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ReasoningAnalysisOutput } from './reasoning-analysis';

// Schema for generating coding questions
const GenerateCodingQuestionsInputSchema = z.object({
  role: z.string().describe("The job role the user is interviewing for (e.g., 'Web Developer', 'ML Engineer')."),
  level: z.string().describe("The experience level for the role (e.g., 'Entry Level', 'Senior Level')."),
  count: z.number().int().min(1).max(5).describe("The number of questions to generate."),
});

const CodingQuestionSchema = z.object({
  question: z.string().describe("The coding problem statement."),
  topic: z.string().describe("The primary topic of the question (e.g., 'Arrays', 'Recursion', 'System Design')."),
});
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;

const GenerateCodingQuestionsOutputSchema = z.object({
  questions: z.array(CodingQuestionSchema).describe("An array of generated coding questions."),
});


// Schema for analyzing a coding attempt
const AnalyzeCodingAttemptInputSchema = z.object({
  videoDataUri: z.string().describe("The interview video, as a data URI."),
  role: z.string().describe("The job role."),
  level: z.string().describe("The experience level."),
  question: z.string().describe("The coding question that was asked."),
  code: z.string().describe("The code written by the user as their solution."),
});

const CodingAnalysisSchema = z.object({
    isCorrect: z.boolean().describe("Whether the provided code correctly solves the problem."),
    correctnessDescription: z.string().describe("A detailed explanation of the code's correctness, including edge cases it might miss."),
    efficiency: z.string().describe("Analysis of the code's time and space complexity (Big O notation) and suggestions for optimization."),
    styleAndReadability: z.string().describe("Feedback on code formatting, variable naming, and overall readability."),
    alternativeApproaches: z.string().describe("Suggestions for alternative methods or algorithms to solve the problem."),
});

const AnalyzeCodingAttemptOutputSchema = z.object({
    transcript: z.string(),
    interviewSummary: z.string(),
    videoAnalysis: z.object({
        posture: z.string(),
        bodyLanguage: z.string(),
        eyeContact: z.string(),
    }),
    vocalAnalysis: z.object({
        clarity: z.string(),
        pacing: z.string(),
        fillerWordCount: z.number(),
        unprofessionalWordCount: z.number(),
    }),
    contentAnalysis: z.object({
        answerClarity: z.string(),
        relevance: z.string(),
        improvementSuggestions: z.string(),
    }),
    guidance: z.array(z.string()),
    codingAnalysis: CodingAnalysisSchema,
});
export type AnalyzeCodingAttemptOutput = z.infer<typeof AnalyzeCodingAttemptOutputSchema>;


// Exported functions
export async function generateCodingQuestions(input: z.infer<typeof GenerateCodingQuestionsInputSchema>) {
  return generateCodingQuestionsFlow(input);
}

export async function analyzeCodingAttempt(input: z.infer<typeof AnalyzeCodingAttemptInputSchema>): Promise<AnalyzeCodingAttemptOutput> {
  return analyzeCodingAttemptFlow(input);
}


// AI Prompts
const generateQuestionsPrompt = ai.definePrompt({
  name: 'generateCodingQuestionsPrompt',
  input: {schema: GenerateCodingQuestionsInputSchema},
  output: {schema: GenerateCodingQuestionsOutputSchema},
  prompt: `You are an expert technical interviewer. Generate {{{count}}} coding interview questions appropriate for a {{{level}}} {{{role}}}. The questions should be practical and relevant to the role. For each question, provide a topic. Ensure the questions cover a reasonable range of topics for the given role.
  
  Do not include the solution in your response. Only provide the problem statement and the topic.`,
});

const analyzeCodingPrompt = ai.definePrompt({
    name: 'analyzeCodingPrompt',
    input: { schema: AnalyzeCodingAttemptInputSchema },
    output: { schema: AnalyzeCodingAttemptOutputSchema },
    prompt: `You are an expert interview coach reviewing a technical interview submission. The user was asked to solve a coding problem. You have access to a video of them explaining their thought process and their final code submission.
    
    Perform a comprehensive, two-part analysis.
    
    **Part 1: Standard Interview Performance (Video/Audio Analysis)**
    Analyze the video to provide standard interview feedback. Follow these steps exactly as you would for a behavioral interview:
    - Transcribe the entire video, identifying the speaker as "Interviewee".
    - Write a brief summary of the user's explanation.
    - Analyze video for posture, body language, and eye contact.
    - Analyze audio for clarity, pacing, and count filler/unprofessional words.
    - Analyze the content of their explanation for clarity and structure.
    - Provide 3-5 actionable guidance points based on this video/audio analysis.

    **Part 2: Technical Coding Analysis**
    Now, critically evaluate the provided code solution.
    - **Question:** {{{question}}}
    - **Role:** {{{role}}}
    - **Level:** {{{level}}}
    - **User's Code:**
    \`\`\`
    {{{code}}}
    \`\`\`
    
    Based on the code, provide the following analysis:
    - **Correctness:** Does the code work? Does it handle edge cases? Explain why or why not.
    - **Efficiency:** Analyze the time and space complexity (Big O). Is it optimal? Suggest improvements.
    - **Style & Readability:** Comment on the code's style, naming conventions, and how easy it is to understand.
    - **Alternative Approaches:** Briefly mention other ways the problem could be solved (e.g., using a different data structure or algorithm).

    Combine both parts of your analysis into a single, structured JSON response.

    **Video for analysis:**
    {{media url=videoDataUri}}
    `,
});


// Genkit Flows
const generateCodingQuestionsFlow = ai.defineFlow(
  {
    name: 'generateCodingQuestionsFlow',
    inputSchema: GenerateCodingQuestionsInputSchema,
    outputSchema: GenerateCodingQuestionsOutputSchema,
  },
  async (input) => {
    const {output} = await generateQuestionsPrompt(input);
    return output!;
  }
);

const analyzeCodingAttemptFlow = ai.defineFlow(
  {
    name: 'analyzeCodingAttemptFlow',
    inputSchema: AnalyzeCodingAttemptInputSchema,
    outputSchema: AnalyzeCodingAttemptOutputSchema,
  },
  async (input) => {
    // This flow combines video analysis with code analysis.
    // The prompt is powerful enough to handle both in one call.
    const { output } = await analyzeCodingPrompt(input);
    return output!;
  }
);
