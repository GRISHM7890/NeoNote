
'use server';
/**
 * @fileOverview AI flow to generate a pack of custom stickers based on a topic.
 *
 * This flow takes a topic and uses an image generation model to create a
 * downloadable sticker sheet.
 *
 * - generateStickers - The main function to orchestrate the sticker generation.
 * - GenerateStickersInput - The input type for the flow.
 * - GenerateStickersOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// 1. Define Input/Output Schemas
export type GenerateStickersInput = z.infer<typeof GenerateStickersInputSchema>;
const GenerateStickersInputSchema = z.object({
  topic: z.string().describe("The topic to generate stickers about (e.g., 'Photosynthesis', 'Ancient Rome')."),
});

export type GenerateStickersOutput = z.infer<typeof GenerateStickersOutputSchema>;
const GenerateStickersOutputSchema = z.object({
  stickerSheetUrl: z.string().url().describe("A data URI string for the generated sticker sheet image."),
});


// 2. Define the main flow
export async function generateStickers(input: GenerateStickersInput): Promise<GenerateStickersOutput> {
  
  const imagePrompt = `A sticker sheet of 6 cute, vector art stickers about '${input.topic}'. The stickers should be die-cut with a white border, on a simple light gray background. The art style should be flat, colorful, and suitable for a student's notebook.`;
  
  const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: imagePrompt,
      config: {
          responseModalities: ['TEXT', 'IMAGE'],
      },
  });

  if (!media?.url) {
    throw new Error("The AI failed to generate a sticker sheet for this topic.");
  }
  
  return { stickerSheetUrl: media.url };
}
