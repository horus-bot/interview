'use server';

import { z } from 'zod';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize both APIs
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Schema definitions (keep existing schemas)
const GenerateCodingQuestionsInputSchema = z.object({
  role: z.string().describe('The role for the interview (e.g., Python Developer)'),
  level: z.string().describe('The experience level (Entry Level, Mid Level, Senior Level)'),
  count: z.number().describe('Number of questions to generate'),
});

const CodingQuestionSchema = z.object({
  question: z.string().describe('The coding problem statement'),
  topic: z.string().describe('The primary topic/algorithm area'),
});

const GenerateCodingQuestionsOutputSchema = z.object({
  questions: z.array(CodingQuestionSchema).describe('Array of generated coding questions'),
});

const AnalyzeCodingAttemptInputSchema = z.object({
  videoDataUri: z.string(),
  question: z.string(),
  code: z.string(),
  role: z.string(),
  level: z.string(),
});

const AnalyzeCodingAttemptOutputSchema = z.object({
  transcript: z.string(),
  score: z.number().min(0).max(100),
  feedback: z.object({
    strengths: z.array(z.string()),
    improvements: z.array(z.string()),
    codeQuality: z.string(),
    problemSolving: z.string(),
    communication: z.string(),
  }),
});

export type GenerateCodingQuestionsInput = z.infer<typeof GenerateCodingQuestionsInputSchema>;
export type GenerateCodingQuestionsOutput = z.infer<typeof GenerateCodingQuestionsOutputSchema>;
export type CodingQuestion = z.infer<typeof CodingQuestionSchema>;
export type AnalyzeCodingAttemptInput = z.infer<typeof AnalyzeCodingAttemptInputSchema>;
export type AnalyzeCodingAttemptOutput = z.infer<typeof AnalyzeCodingAttemptOutputSchema>;

// Fixed: Updated Groq model name
export async function generateCodingQuestions(input: GenerateCodingQuestionsInput): Promise<GenerateCodingQuestionsOutput> {
  try {
    const prompt = `You are an expert technical interviewer with 10+ years of experience. Generate ${input.count} highly personalized coding interview questions for a ${input.level} ${input.role} position.

REQUIREMENTS:
- Questions must be practical and directly relevant to ${input.role} daily work
- Difficulty appropriate for ${input.level} candidates
- Include real-world scenarios they'd encounter in this role
- Focus on problem-solving skills and technical depth
- Avoid generic leetcode-style problems - make them job-specific

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
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct", // Updated to the new model
      temperature: 0.8,
      max_tokens: 2000,
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
    
    // Enhanced fallback questions based on role and level
    const getFallbackQuestions = (role: string, level: string): CodingQuestion[] => {
      const roleQuestions: Record<string, CodingQuestion[]> = {
        "Python Developer": [
          {
            question: "Design a REST API endpoint for a user management system. Include input validation, error handling, and database operations. Show how you would structure the code for maintainability.",
            topic: "API Development & Architecture"
          },
          {
            question: "Implement a data processing pipeline that handles CSV file uploads, validates the data, and stores it in a database. Include error handling for malformed data.",
            topic: "Data Processing & Validation"
          },
          {
            question: "Create a caching mechanism for expensive database queries. Explain your strategy for cache invalidation and handling race conditions.",
            topic: "Performance Optimization"
          }
        ],
        "ML Engineer": [
          {
            question: "Design a machine learning pipeline for real-time prediction serving. Include model loading, preprocessing, prediction, and monitoring components.",
            topic: "ML Pipeline Architecture"
          },
          {
            question: "Implement a feature store system that can handle both batch and streaming data. Show how you would ensure data consistency and versioning.",
            topic: "Feature Engineering"
          },
          {
            question: "Create a model evaluation framework that compares multiple models and selects the best one based on business metrics.",
            topic: "Model Evaluation"
          }
        ],
        "Web Developer": [
          {
            question: "Build a real-time notification system for a web application. Include WebSocket implementation, message queuing, and user presence detection.",
            topic: "Real-time Systems"
          },
          {
            question: "Design a shopping cart component with state management, local storage persistence, and optimistic updates. Handle concurrent modifications.",
            topic: "Frontend State Management"
          },
          {
            question: "Implement a file upload system with progress tracking, chunk uploading, and resume capability. Include both frontend and backend code.",
            topic: "File Upload Systems"
          }
        ],
        "Data Analyst": [
          {
            question: "Create a data analysis script that processes sales data, identifies trends, and generates automated reports. Include data cleaning and visualization.",
            topic: "Data Analysis & Reporting"
          },
          {
            question: "Build a dashboard that displays KPIs from multiple data sources. Show how you would handle data refresh, caching, and user interactions.",
            topic: "Dashboard Development"
          },
          {
            question: "Implement a SQL query optimization system that analyzes and improves slow-running queries. Include performance monitoring.",
            topic: "Query Optimization"
          }
        ],
        "Database Manager": [
          {
            question: "Design a database schema for a multi-tenant SaaS application. Include data isolation, indexing strategy, and migration procedures.",
            topic: "Database Design"
          },
          {
            question: "Implement a database backup and recovery system with point-in-time recovery capability. Show monitoring and alerting components.",
            topic: "Backup & Recovery"
          },
          {
            question: "Create a database performance monitoring tool that identifies bottlenecks and suggests optimizations. Include query analysis.",
            topic: "Performance Monitoring"
          }
        ]
      };

      const questions = roleQuestions[role] || roleQuestions["Python Developer"];
      
      if (level === "Entry Level") {
        return questions.map(q => ({
          ...q,
          question: q.question + " Focus on basic implementation and explain your reasoning step by step."
        }));
      } else if (level === "Senior Level") {
        return questions.map(q => ({
          ...q,
          question: q.question + " Consider scalability, security, and maintainability in your solution. Discuss trade-offs and alternative approaches."
        }));
      }
      
      return questions;
    };
    
    const fallbackQuestions = getFallbackQuestions(input.role, input.level);
    return { questions: fallbackQuestions.slice(0, input.count) };
  }
}

// Fixed: Server-side analysis without browser APIs
export async function analyzeCodingAttempt(input: AnalyzeCodingAttemptInput): Promise<AnalyzeCodingAttemptOutput> {
  try {
    // Use Gemini 1.5 Flash for cost efficiency
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Extract base64 data from data URI (already compressed from client)
    const videoData = input.videoDataUri.includes(',') 
      ? input.videoDataUri.split(',')[1] 
      : input.videoDataUri;
    
    const analysisPrompt = `You are an expert technical interviewer analyzing a ${input.level} ${input.role} coding interview submission.

INTERVIEW CONTEXT:
- Role: ${input.role}
- Level: ${input.level}
- Question Asked: ${input.question}

CANDIDATE'S SUBMITTED CODE:
${input.code}

Please analyze both the VIDEO/AUDIO content and the WRITTEN CODE to provide comprehensive feedback.

ANALYSIS REQUIREMENTS:
1. VIDEO/AUDIO ANALYSIS:
   - Communication clarity and confidence
   - Problem-solving thought process (verbal explanation)
   - Technical presentation skills
   - Body language and professionalism

2. CODE ANALYSIS:
   - Correctness and functionality
   - Code quality and best practices
   - Algorithm efficiency (time/space complexity)
   - Readability and maintainability
   - Relevance to ${input.role} role requirements

3. OVERALL ASSESSMENT:
   - How well does the candidate explain their solution?
   - Do they demonstrate deep understanding of the concepts?
   - Are they communicating effectively during problem-solving?
   - Overall interview performance for ${input.level} level

Format your response as a JSON object:
{
  "transcript": "Brief summary of what the candidate demonstrated in video and code",
  "score": 85,
  "feedback": {
    "strengths": ["Specific strengths observed from video and code analysis"],
    "improvements": ["Specific areas for improvement from both video and code"], 
    "codeQuality": "Detailed assessment of the submitted code quality and correctness",
    "problemSolving": "Assessment of problem-solving approach demonstrated in video",
    "communication": "Assessment of verbal communication and explanation skills from video"
  }
}

Provide specific, actionable feedback based on both the video performance and code submission.`;

    const result = await model.generateContent([
      {
        text: analysisPrompt
      },
      {
        inlineData: {
          mimeType: "video/mp4",
          data: videoData
        }
      }
    ]);

    const response = result.response.text();
    
    // Extract JSON from the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return AnalyzeCodingAttemptOutputSchema.parse(parsedResponse);
    
  } catch (error) {
    console.error('Error analyzing coding attempt with Gemini Flash:', error);
    
    // Enhanced fallback analysis
    const codeAnalysis = analyzeCodeFallback(input.code);
    
    return {
      transcript: `Analysis completed using fallback method. Code review performed for ${input.role} ${input.level} position.`,
      score: codeAnalysis.score,
      feedback: {
        strengths: codeAnalysis.strengths,
        improvements: codeAnalysis.improvements,
        codeQuality: codeAnalysis.codeQuality,
        problemSolving: `Demonstrated ${input.level.toLowerCase()} level approach to problem-solving. Focus on systematic breakdown of requirements and implementation planning.`,
        communication: "Video analysis unavailable in fallback mode. Consider practicing verbal explanation of coding thought process during interviews."
      }
    };
  }
}

// Enhanced fallback code analysis helper
function analyzeCodeFallback(code: string) {
  const codeLength = code.length;
  const hasComments = /\/\/|\/\*|\#/.test(code);
  const hasProperIndentation = code.includes('  ') || code.includes('\t');
  const hasFunctions = /def |function |const \w+\s*=|class /.test(code);
  const hasErrorHandling = /try|catch|except|if.*error|throw/.test(code);
  const hasVariableNames = /\b[a-z][a-zA-Z0-9_]*\b/.test(code);

  let score = 60; // Base score
  const strengths = [];
  const improvements = [];

  // Scoring logic
  if (codeLength > 100) {
    score += 10;
    strengths.push("Provided substantial code implementation");
  }
  
  if (hasComments) {
    score += 5;
    strengths.push("Included helpful comments in code");
  } else {
    improvements.push("Add comments to explain complex logic");
  }

  if (hasProperIndentation) {
    score += 10;
    strengths.push("Maintained proper code formatting");
  } else {
    improvements.push("Improve code indentation and formatting");
  }

  if (hasFunctions) {
    score += 10;
    strengths.push("Structured code with functions/classes");
  } else {
    improvements.push("Break code into reusable functions");
  }

  if (hasErrorHandling) {
    score += 10;
    strengths.push("Included error handling mechanisms");
  } else {
    improvements.push("Add error handling for edge cases");
  }

  if (hasVariableNames) {
    score += 5;
    strengths.push("Used descriptive variable names");
  }

  // Default improvements if none found
  if (improvements.length === 0) {
    improvements.push("Consider optimizing algorithm complexity");
    improvements.push("Add more comprehensive test cases");
  }

  // Default strengths if none found  
  if (strengths.length === 0) {
    strengths.push("Attempted to solve the problem systematically");
    strengths.push("Demonstrated basic programming concepts");
  }

  const codeQuality = codeLength > 200 
    ? "Code shows good structure and implementation. Consider adding more documentation and edge case handling."
    : codeLength > 50
    ? "Code demonstrates understanding but could be more comprehensive. Focus on completeness and robustness."
    : "Code appears minimal or incomplete. Provide more detailed implementation with proper structure.";

  return { score: Math.min(score, 100), strengths, improvements, codeQuality };
}

// Helper function for role-specific guidance
function getRoleSpecificGuidance(role: string, level: string): string {
  const roleGuidance: Record<string, string> = {
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

  const levelGuidance: Record<string, string> = {
    "Entry Level": "Focus on fundamental concepts, basic implementations, and clear problem-solving approach",
    "Mid Level": "Include system design aspects, optimization considerations, and best practices",
    "Senior Level": "Emphasize architecture decisions, scalability, maintainability, and team leadership aspects"
  };

  return `${roleGuidance[role] || 'General software development challenges'}\n\nLevel considerations: ${levelGuidance[level]}`;
}

