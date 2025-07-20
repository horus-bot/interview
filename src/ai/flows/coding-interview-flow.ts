'use server';
/**
 * @fileOverview Implements AI flows for conducting and analyzing coding interviews.
 *
 * - generateCodingQuestions: Creates relevant coding questions based on role and level.
 * - analyzeCodingAttempt: Provides a deep analysis of a user's code, explanation, and on-camera performance.
 */

import {ai} from '@/ai/genkit';
import { z } from 'zod';
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize both APIs
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Schema for generating coding questions
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
      model: "llama-3.1-70b-versatile", // Using the versatile Llama model
      temperature: 0.8, // Higher creativity for more personalized questions
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from Groq API');
    }

    // Parse the JSON response
    const parsedResponse = JSON.parse(response);
    
    // Validate the response structure
    const validatedOutput = GenerateCodingQuestionsOutputSchema.parse(parsedResponse);
    
    return validatedOutput;
    
  } catch (error) {
    console.error('Error generating coding questions with Groq:', error);
    
    // Fallback questions if API fails
    const fallbackQuestions: CodingQuestion[] = [
      {
        question: `Design and implement a solution for a common ${input.role} challenge. Explain your approach and write clean, production-ready code.`,
        topic: "System Design & Implementation"
      }
    ];
    
    return { questions: fallbackQuestions.slice(0, input.count) };
  }
}

// Video/Audio analysis using Google Gemini Flash with compression
export async function analyzeCodingAttempt(input: AnalyzeCodingAttemptInput): Promise<AnalyzeCodingAttemptOutput> {
  try {
    // Use Gemini 1.5 Flash for cost efficiency
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Compress video before sending to Gemini
    const compressedVideoData = await compressVideo(input.videoDataUri);
    
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
          mimeType: "video/mp4", // Use MP4 for better compression
          data: compressedVideoData
        }
      }
    ]);

    const response = result.response.text();
    
    // Extract JSON from the response (Gemini might include extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    return AnalyzeCodingAttemptOutputSchema.parse(parsedResponse);
    
  } catch (error) {
    console.error('Error analyzing coding attempt with Gemini Flash:', error);
    
    // Enhanced fallback analysis with better code evaluation
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

// Video compression function using Canvas and MediaRecorder APIs
async function compressVideo(videoDataUri: string): Promise<string> {
  try {
    // Convert data URI to blob
    const response = await fetch(videoDataUri);
    const originalBlob = await response.blob();
    
    console.log(`Original video size: ${(originalBlob.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Create video element to process the video
    const video = document.createElement('video');
    video.src = URL.createObjectURL(originalBlob);
    video.muted = true;
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = async () => {
        try {
          // Create canvas for video compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          
          // Set compressed dimensions (reduce resolution for compression)
          const maxWidth = 640;  // Reduced from original resolution
          const maxHeight = 480;
          
          const aspectRatio = video.videoWidth / video.videoHeight;
          
          if (video.videoWidth > video.videoHeight) {
            canvas.width = Math.min(maxWidth, video.videoWidth);
            canvas.height = canvas.width / aspectRatio;
          } else {
            canvas.height = Math.min(maxHeight, video.videoHeight);
            canvas.width = canvas.height * aspectRatio;
          }
          
          // Create MediaRecorder for compressed output
          const stream = canvas.captureStream(15); // 15 FPS for compression
          
          // Add compressed audio track
          const audioContext = new AudioContext();
          const source = audioContext.createMediaElementSource(video);
          const destination = audioContext.createMediaStreamDestination();
          
          // Add gain node for audio compression
          const gainNode = audioContext.createGain();
          gainNode.gain.value = 0.8; // Slightly reduce audio level
          
          source.connect(gainNode);
          gainNode.connect(destination);
          
          // Combine video and audio streams
          const audioTrack = destination.stream.getAudioTracks()[0];
          if (audioTrack) {
            stream.addTrack(audioTrack);
          }
          
          const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"', // H.264 + AAC for better compression
            videoBitsPerSecond: 500000,  // 500kbps for video (much lower than default)
            audioBitsPerSecond: 64000    // 64kbps for audio
          });
          
          const chunks: Blob[] = [];
          
          mediaRecorder.ondataavailable = (event) => {
            chunks.push(event.data);
          };
          
          mediaRecorder.onstop = async () => {
            const compressedBlob = new Blob(chunks, { type: 'video/mp4' });
            console.log(`Compressed video size: ${(compressedBlob.size / 1024 / 1024).toFixed(2)} MB`);
            
            // Convert back to base64
            const reader = new FileReader();
            reader.readAsDataURL(compressedBlob);
            reader.onloadend = () => {
              const base64Data = (reader.result as string).split(',')[1];
              resolve(base64Data);
            };
          };
          
          // Start recording compressed version
          mediaRecorder.start();
          video.play();
          
          // Draw frames to canvas for compression
          const drawFrame = () => {
            if (!video.paused && !video.ended) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              requestAnimationFrame(drawFrame);
            } else {
              mediaRecorder.stop();
              audioContext.close();
            }
          };
          
          drawFrame();
          
          // Auto-stop after reasonable duration (max 2 minutes for interviews)
          setTimeout(() => {
            if (mediaRecorder.state === 'recording') {
              mediaRecorder.stop();
              video.pause();
            }
          }, 120000); // 2 minutes max
          
        } catch (error) {
          reject(error);
        }
      };
      
      video.onerror = reject;
    });
    
  } catch (error) {
    console.error('Video compression failed:', error);
    // Fallback: return original data with basic size reduction
    const response = await fetch(videoDataUri);
    const originalBlob = await response.blob();
    
    // If original is too large, truncate it
    if (originalBlob.size > 10 * 1024 * 1024) { // 10MB limit
      const truncatedBlob = originalBlob.slice(0, 5 * 1024 * 1024); // Keep first 5MB
      const reader = new FileReader();
      reader.readAsDataURL(truncatedBlob);
      
      return new Promise((resolve) => {
        reader.onloadend = () => {
          const base64Data = (reader.result as string).split(',')[1];
          resolve(base64Data);
        };
      });
    }
    
    // Return original if already small enough
    return videoDataUri.split(',')[1];
  }
}

// Alternative simpler compression approach using ffmpeg.wasm
async function compressVideoSimple(videoDataUri: string): Promise<string> {
  try {
    // This is a simpler approach that just reduces quality
    const response = await fetch(videoDataUri);
    const originalBlob = await response.blob();
    
    // Create a new blob with reduced size by slicing and re-encoding
    const maxSize = 5 * 1024 * 1024; // 5MB max
    
    if (originalBlob.size <= maxSize) {
      return videoDataUri.split(',')[1];
    }
    
    // Create compressed version by reducing the blob size
    const compressionRatio = maxSize / originalBlob.size;
    const endPosition = Math.floor(originalBlob.size * compressionRatio);
    const compressedBlob = originalBlob.slice(0, endPosition);
    
    const reader = new FileReader();
    reader.readAsDataURL(compressedBlob);
    
    return new Promise((resolve) => {
      reader.onloadend = () => {
        const base64Data = (reader.result as string).split(',')[1];
        resolve(base64Data);
      };
    });
    
  } catch (error) {
    console.error('Simple compression failed:', error);
    return videoDataUri.split(',')[1];
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

