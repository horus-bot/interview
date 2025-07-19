
'use server';
/**
 * @fileOverview Implements AI flows for conducting and analyzing coding interviews.
 *
 * - generateCodingQuestions: Creates relevant coding questions based on role and level.
 * - analyzeCodingAttempt: Provides a deep analysis of a user's code, explanation, and on-camera performance.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
    prompt: `You are a world-class, strict, and highly critical interview coach reviewing a technical interview submission. The user has recorded their entire session, which includes introductory questions, a conceptual explanation, and then their coding process. Your analysis must be thorough, critical, and provide actionable, specific feedback.

**Video for analysis:**
{{media url=videoDataUri}}

Perform a comprehensive, two-part analysis based on the full video.

**Part 1: Interview Performance Analysis (Full Video & Audio)**

First, analyze the interviewee's communication and presence throughout the entire recording.
- **Transcript:** Transcribe the entire video. Enable speaker diarization and label speakers as "Interviewer" and "Interviewee".
- **Summary:** Write a brief, concise summary of the entire interview, from the introduction to the final code explanation.
- **Video Analysis:** Be very critical.
  - **Posture:** Did they slouch? Were they sitting up straight and appearing engaged?
  - **Body Language:** Note any fidgeting, nervous ticks, or distracting gestures. Did they convey confidence or anxiety?
  - **Eye Contact:** Did they maintain consistent eye contact with the camera, or did their eyes dart around? Be specific.
- **Vocal Analysis:**
  - **Clarity & Pacing:** Was their speech clear and well-paced, or did they mumble or rush?
  - **Filler Words:** Count all filler words (um, uh, like, so, you know).
  - **Unprofessional Language:** Count any overly casual or unprofessional words.
- **Content Analysis:**
  - **Answer Clarity:** Were their explanations (both for the intro and the coding problem) clear, structured, and easy to follow?
  - **Relevance:** Were their answers concise and to the point?
  - **Improvement Suggestions:** Provide specific examples of how they could have improved their explanations.
- **Actionable Guidance:** Based on the above, provide 3-5 of the MOST IMPORTANT, actionable recommendations for improvement.

**Part 2: Technical Coding Analysis**

Now, switch to the role of a senior technical lead and critically evaluate the provided code solution. Do not be easily impressed.
- **Question:** {{{question}}}
- **Role:** {{{role}}}
- **Level:** {{{level}}}
- **User's Code:**
\`\`\`
{{{code}}}
\`\`\`

Based on the code, provide the following analysis:
- **Correctness:** Does it actually work? Does it handle all common edge cases (e.g., empty inputs, nulls, large numbers)? Point out specific flaws.
- **Efficiency:** Analyze time and space complexity (Big O notation). Is it the optimal solution, or just a brute-force one? Suggest more efficient algorithms if they exist.
- **Style & Readability:** Comment on code style, naming conventions, and clarity. Is it production-quality code? Is it easy for another engineer to understand?
- **Alternative Approaches:** Briefly mention other superior or different ways the problem could be solved (e.g., using a different data structure, algorithm, or paradigm).

Combine both parts of your analysis into a single, structured JSON response. Your feedback should be direct, honest, and aimed at genuinely helping the user improve for a real-world, competitive interview.`,
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

    