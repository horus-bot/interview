'use server';

import { z } from 'zod';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize both APIs
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const LLAVA_ANALYSIS_API_URL = process.env.LLAVA_ANALYSIS_API_URL || 'http://127.0.0.1:8000/analyze';

// Schema definitions (keep existing schemas)
const GenerateCodingQuestionsInputSchema = z.object({
  role: z.string().describe('The role for the interview (e.g., Python Developer)'),
  level: z.string().describe('The experience level (Entry Level, Mid Level, Senior Level)'),
  count: z.number().describe('Number of questions to generate'),
  resumeText: z.string().describe('Candidate resume text used for personalization.')
});

const CodingQuestionSchema = z.object({
  question: z.string().describe('The coding problem statement'),
  topic: z.string().describe('The primary topic/algorithm area')
});

const GenerateCodingQuestionsOutputSchema = z.object({
  questions: z.array(CodingQuestionSchema).describe('Array of generated coding questions')
});

const AnalyzeCodingAttemptInputSchema = z.object({
  question: z.string(),
  code: z.string(),
  spokenTranscript: z.string().optional().default(''),
  role: z.string(),
  level: z.string(),
  resumeText: z.string(),
  frameImages: z.array(z.string()).min(1).max(10),
  totalDurationSeconds: z.number().positive()
});

const AnalyzeCodingAttemptOutputSchema = z.object({
  transcript: z.string(),
  score: z.number().min(0).max(100),
  scoreBreakdown: z.object({
    codeQuality: z.number().min(0).max(100),
    problemSolving: z.number().min(0).max(100),
    visualConfidence: z.number().min(0).max(100),
    grammar: z.number().min(0).max(100),
    fluency: z.number().min(0).max(100)
  }).default({
    codeQuality: 0,
    problemSolving: 0,
    visualConfidence: 0,
    grammar: 0,
    fluency: 0
  }),
  visualFrameAnalysis: z.string().default('No visual frame analysis available.'),
  questionByQuestionAnalysis: z.array(z.object({
    question: z.string(),
    score: z.number().min(0).max(100),
    findings: z.string(),
    drawnFrom: z.object({
      code: z.string(),
      spokenExplanation: z.string(),
      visualFrame: z.string()
    })
  })).default([]),
  feedback: z.object({
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    codeQuality: z.string(),
    problemSolving: z.string(),
    communication: z.string()
  })
});







async function analyzeFrameWithLlava(frameDataUri) {
  const base64Payload = frameDataUri.includes(',') ? frameDataUri.split(',')[1] : frameDataUri;
  const buffer = Buffer.from(base64Payload, 'base64');
  const fileBlob = new Blob([buffer], { type: 'image/jpeg' });

  const formData = new FormData();
  formData.append('file', fileBlob, 'frame.jpg');

  const response = await fetch(LLAVA_ANALYSIS_API_URL, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLaVA API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  if (!data?.analysis || typeof data.analysis !== 'string') {
    throw new Error('LLaVA API returned invalid analysis payload.');
  }

  return data.analysis;
}

// Fixed: Updated Groq model name
export async function generateCodingQuestions(input) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY environment variable.');
    }

    const prompt = `You are an expert technical interviewer with 10+ years of experience. Generate ${input.count} highly personalized coding interview questions for a ${input.level} ${input.role} position.

CANDIDATE RESUME:
${input.resumeText}

REQUIREMENTS:
- Questions must be practical and directly relevant to ${input.role} daily work
- Difficulty appropriate for ${input.level} candidates
- Include real-world scenarios they'd encounter in this role
- Focus on problem-solving skills and technical depth
- Avoid generic leetcode-style problems - make them job-specific
- Use resume details (projects, tools, stack, achievements) to tailor every question
- If resume has missing detail, infer reasonable scenarios from the listed stack only

ROLE-SPECIFIC FOCUS:
${getRoleSpecificGuidance(input.role, input.level)}

Format your response as a JSON object with this exact structure:
{
  "questions": [
    {
      "question": "Detailed problem statement here...",
      "topic": "Primary algorithm/concept area"
    }
  ]
}

Generate exactly ${input.count} question(s).`;

    const completion = await groq.chat.completions.create({
      messages: [
      {
        role: "system",
        content: "You are an expert technical interviewer. Always respond with valid JSON only, no additional text or formatting."
      },
      {
        role: "user",
        content: prompt
      }],

      model: "llama-3.3-70b-versatile", // Use a valid Groq model
      temperature: 0.8,
      max_tokens: 2000
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    const parsedResponse = JSON.parse(response);
    const validatedOutput = GenerateCodingQuestionsOutputSchema.parse(parsedResponse);

    return validatedOutput;

  } catch (error) {
    console.error('Error generating coding questions with Groq:', error);
    throw new Error(`Groq question generation failed: ${error?.message || 'Unknown error'}`);
  }
}

// Fixed: Server-side analysis without browser APIs
export async function analyzeCodingAttempt(input) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY environment variable.');
    }

    // Phase 1: Use LLaVA API on a single representative frame for visual analysis
    let visualAnalysisSummary = 'Visual analysis unavailable. Proceeding with code and transcript analysis only.';

    try {
      const selectedFrameIndex = Math.floor((input.frameImages.length - 1) / 2);
      const selectedFrame = input.frameImages[selectedFrameIndex] || input.frameImages[0];
      visualAnalysisSummary = await analyzeFrameWithLlava(selectedFrame);
    } catch (llavaError) {
      console.warn('LLaVA frame analysis failed, proceeding without visual frame analysis:', llavaError?.message || llavaError);
    }

    // Phase 2: Complete analysis with Groq utilizing local API visual summary, transcript, resume, and code
    const groqPrompt = `You are an expert technical interviewer analyzing a ${input.level} ${input.role} coding interview submission.

INTERVIEW CONTEXT:
- Role: ${input.role}
- Level: ${input.level}
- Question Asked: ${input.question}

CANDIDATE'S SUBMITTED CODE:
${input.code}

CANDIDATE'S SPOKEN EXPLANATION (browser speech-to-text):
${input.spokenTranscript || 'No spoken transcript provided.'}

CANDIDATE RESUME:
${input.resumeText}

VISUAL FRAME ANALYSIS (from LLaVA API):
${visualAnalysisSummary}

Please combine the local API visual frame analysis (used here as video-analysis proxy), the candidate's custom coding submission, and their resume baseline to provide comprehensive feedback.

ANALYSIS REQUIREMENTS:
1. OVERALL EVALUATION:
  - Treat the local API frame analysis as the visual/video signal source.
  - Do not invent timeline or multi-frame events that are not present in that input.
  - Combine visual signal with code correctness to evaluate confidence and skill.
  - Use the spoken explanation to assess communication clarity and reasoning quality.
   - Alignment between resume-claimed skills and actual code quality.
   - Is the delivery interview-ready for a real coding round?

2. CODE ANALYSIS:
   - Correctness and functionality.
   - Code quality, best practices, and readability.
   - Algorithm efficiency (time/space complexity).
   - Relevance to ${input.role} role requirements.

3. AUDIO TRANSCRIPT ANALYSIS:
  - Evaluate whether the spoken explanation matches the implemented code.
  - Highlight mismatches between stated approach and actual implementation.
  - Analyze only the spoken transcript text for language quality.
  - Score grammar quality from the spoken transcript (sentence structure, correctness, clarity).
  - Score fluency from the spoken transcript (flow, coherence, phrasing quality).

Format your response as a JSON object:
{
  "transcript": "Brief chronological summary combining visual confidence assessment (if available) and code strategy",
  "score": 85,
  "scoreBreakdown": {
    "codeQuality": 84,
    "problemSolving": 80,
    "visualConfidence": 76,
    "grammar": 72,
    "fluency": 70
  },
  "visualFrameAnalysis": "Specific findings from the local API one-frame image analysis.",
  "questionByQuestionAnalysis": [
    {
      "question": "Exact interview question text",
      "score": 84,
      "findings": "Specific analysis for this question",
      "drawnFrom": {
        "code": "What was inferred from submitted code",
        "spokenExplanation": "What was inferred from spoken transcript",
        "visualFrame": "What was inferred from the single visual frame"
      }
    }
  ],
  "feedback": {
    "strengths": ["Specific strengths observed from video body language (if available) and code analysis"],
    "improvements": ["Specific areas for improvement from both video (if available) and code"], 
    "codeQuality": "Detailed assessment of the submitted code quality and correctness",
    "problemSolving": "Assessment of problem-solving approach demonstrated in code combined with observed stress levels (if available)",
    "communication": "Assessment of visual communication, body language, and implicit explanation skills from video (if available)"
  }
}

Respond ONLY with valid JSON. No markdown wrappers around the JSON.`;

    const groqCompletion = await groq.chat.completions.create({
      messages: [
      {
        role: "system",
        content: "You are an expert technical interviewer and strict JSON generator. Use only provided inputs, treat local API frame analysis as the visual/video source, avoid fabricating unseen events, and return only raw valid JSON."
      },
      {
        role: "user",
        content: groqPrompt
      }],

      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 2500
    });

    const response = groqCompletion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Extract JSON from the response if any markdown is returned
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : response;

    const parsedResponse = JSON.parse(jsonString);
    return AnalyzeCodingAttemptOutputSchema.parse(parsedResponse);

  } catch (error) {
    console.error('Error analyzing coding attempt:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('LLaVA') || error.message.includes('11434') || error.message.includes('analyze')) {
        throw new Error('LLaVA API issue. Ensure your FastAPI service is running and reachable at LLAVA_ANALYSIS_API_URL.');
      }
      if (error.message.includes('GROQ_API_KEY') || error.message.includes('groq')) {
        throw new Error('Groq API key issue. Please verify GROQ_API_KEY configuration.');
      }
    }

    throw new Error('Analysis failed. Please check API keys and try again.');
  }
}

// Helper function for role-specific guidance
function getRoleSpecificGuidance(role, level) {
  const roleGuidance = {
    "Python Developer": `
- Data structures and algorithms in Python context
- Web frameworks (Django/Flask) challenges  
- API design and database integration
- Python-specific optimization techniques
- Testing and debugging scenarios`,

    "ML Engineer": `
- Model training and evaluation problems
- Data preprocessing and feature engineering
- MLOps and model deployment challenges
- Performance optimization for ML pipelines
- Real-world ML system design`,

    "Web Developer": `
- Frontend/backend integration challenges
- Database design and optimization
- Authentication and security implementation
- Performance optimization techniques
- Modern web development patterns`,

    "Data Analyst": `
- Data cleaning and transformation problems
- Statistical analysis implementation
- Visualization logic and design
- SQL query optimization
- Business logic implementation`,

    "Database Manager": `
- Database schema design challenges
- Query optimization problems
- Data migration and backup strategies
- Performance tuning scenarios
- Database security implementation`
  };

  const levelGuidance = {
    "Entry Level": "Focus on fundamental concepts, basic implementations, and clear problem-solving approach",
    "Mid Level": "Include system design aspects, optimization considerations, and best practices",
    "Senior Level": "Emphasize architecture decisions, scalability, maintainability, and team leadership aspects"
  };

  return `${roleGuidance[role] || 'General software development challenges'}\n\nLevel considerations: ${levelGuidance[level]}`;
}