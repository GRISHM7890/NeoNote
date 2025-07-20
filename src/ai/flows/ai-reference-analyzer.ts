'use server';
/**
 * @fileOverview AI-powered reference book analysis and video generation flow.
 *
 * - analyzeReferenceBook - Analyzes a book and generates explainer videos for key topics.
 * - checkVideoStatus - Checks the status of a video generation operation.
 * - ReferenceBookInput - The input type for the analyzeReferenceBook function.
 * - ReferenceBookOutput - The return type for the analyzeReferenceBook function.
 * - VideoStatusInput - The input type for the checkVideoStatus function.
 * - VideoStatusOutput - The return type for the checkVideoStatus function.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import { z } from 'genkit';
import { MediaPart } from 'genkit/model';
import fetch from 'node-fetch';

// Input and Output Schemas
const TopicSchema = z.object({
  topicName: z.string().describe('A key topic or chapter from the book.'),
  description: z.string().describe('A brief, one-sentence description of the topic.'),
});

const ReferenceBookInputSchema = z.object({
  bookTitle: z.string().describe('The title of the reference book.'),
  author: z.string().optional().describe('The author of the book.'),
});
export type ReferenceBookInput = z.infer<typeof ReferenceBookInputSchema>;

const TopicWithVideoOperationSchema = TopicSchema.extend({
    operationName: z.string().describe("The name of the long-running video generation operation."),
});

const ReferenceBookOutputSchema = z.object({
  difficulty: z.string().describe('The estimated difficulty level (e.g., "Beginner", "Intermediate", "Advanced for NEET/JEE").'),
  topics: z.array(TopicWithVideoOperationSchema).describe('A list of key topics from the book, each with a video generation operation ID.'),
});
export type ReferenceBookOutput = z.infer<typeof ReferenceBookOutputSchema>;


const VideoStatusInputSchema = z.object({
  operationName: z.string(),
});
export type VideoStatusInput = z.infer<typeof VideoStatusInputSchema>;

const VideoStatusOutputSchema = z.object({
  done: z.boolean(),
  videoDataUri: z.string().optional().describe("The generated video as a Base64 encoded data URI. Only present when 'done' is true."),
});
export type VideoStatusOutput = z.infer<typeof VideoStatusOutputSchema>;


// Main flow to analyze book and start video generation
const analyzeBookPrompt = ai.definePrompt({
    name: 'analyzeBookPrompt',
    input: { schema: ReferenceBookInputSchema },
    output: { schema: z.object({
        difficulty: z.string().describe('The estimated difficulty level (e.g., "Beginner", "Intermediate", "Advanced for NEET/JEE").'),
        topics: z.array(TopicSchema).describe('A list of 3-5 key topics from the book.'),
    })},
    prompt: `You are an expert curriculum designer. Analyze the provided book title and author to determine its key topics and difficulty level.
    
    Book Title: {{bookTitle}}
    {{#if author}}Author: {{author}}{{/if}}
    
    Identify 3 to 5 of the most important, fundamental topics covered in this book. For each topic, provide a short, one-sentence description.
    Also, assess the overall difficulty and intended audience of the book.
    `,
});

const generateVideoFlow = ai.defineFlow(
    {
        name: 'generateVideoFlow',
        inputSchema: TopicSchema,
        outputSchema: z.string(), // Operation name
    },
    async (topic) => {
        const prompt = `Create a short, 5-second educational video explaining the concept of "${topic.topicName}". The video should be visually engaging and suitable for a student learning about this topic. This is the core idea: ${topic.description}.`;

        const { operation } = await ai.generate({
            model: googleAI.model('veo-2.0-generate-001'),
            prompt: prompt,
            config: {
                durationSeconds: 5,
                aspectRatio: '16:9',
            },
        });
        if (!operation) {
            throw new Error("Failed to start video generation operation.");
        }
        return operation.name;
    }
);


export async function analyzeReferenceBook(input: ReferenceBookInput): Promise<ReferenceBookOutput> {
  // 1. Analyze the book to get topics and difficulty
  const { output } = await analyzeBookPrompt(input);
  if (!output) {
    throw new Error('Failed to analyze the book.');
  }

  // 2. For each topic, start a video generation flow in parallel
  const videoPromises = output.topics.map(async (topic) => {
    const operationName = await generateVideoFlow(topic);
    return {
      ...topic,
      operationName,
    };
  });

  const topicsWithOps = await Promise.all(videoPromises);

  return {
    difficulty: output.difficulty,
    topics: topicsWithOps,
  };
}


// Flow to check video status
async function downloadVideo(video: MediaPart): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable not set.");
    }

    const downloadUrl = `${video.media!.url}&key=${apiKey}`;
    const response = await fetch(downloadUrl);

    if (!response.ok || !response.body) {
        throw new Error(`Failed to download video: ${response.statusText}`);
    }
    const videoBuffer = await response.arrayBuffer();
    const base64Video = Buffer.from(videoBuffer).toString('base64');
    
    // Veo returns webm, but let's assume mp4 for broader compatibility as browsers handle it.
    // The actual content type is often not populated correctly.
    const contentType = video.media?.contentType || 'video/mp4'; 
    
    return `data:${contentType};base64,${base64Video}`;
}


export async function checkVideoStatus(input: VideoStatusInput): Promise<VideoStatusOutput> {
    let operation = await ai.checkOperation({ name: input.operationName });

    if (!operation.done) {
        return { done: false };
    }

    if (operation.error) {
        console.error('Video generation failed:', operation.error);
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const videoPart = operation.output?.message?.content.find((p) => !!p.media);
    if (!videoPart) {
        throw new Error('Generated operation result does not contain a video.');
    }
    
    const videoDataUri = await downloadVideo(videoPart);

    return {
        done: true,
        videoDataUri: videoDataUri,
    };
}
