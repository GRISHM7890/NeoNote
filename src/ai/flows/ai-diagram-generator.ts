
'use server';
/**
 * @fileOverview AI flow to generate a scientific or educational diagram.
 *
 * This flow takes a topic and uses an image generation model to create a
 * visually appealing diagram.
 *
 * - generateDiagram - The main function to orchestrate the diagram generation.
 * - GenerateDiagramInput - The input type for the flow.
 * - GenerateDiagramOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;
const GenerateDiagramInputSchema = z.object({
  topic: z.string().describe("The topic for the diagram (e.g., 'The Human Heart', 'Photosynthesis Process')."),
});

export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;
const GenerateDiagramOutputSchema = z.object({
  diagramUrl: z.string().url().nullable().describe("A data URI string for the generated diagram image, or null if generation failed."),
});


// 2. Define the main flow
export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  
  const imagePrompt = `A clear, visually appealing, educational diagram of '${input.topic}'. The diagram should have clean lines, clear and readable labels, and annotations suitable for a textbook or study material. The style should be a modern, simple, vector illustration. White background. The labels must be in legible English.`;
  
  try {
    const { media } = await ai.generate({
        model: 'googleai/gemini-2.0-flash-preview-image-generation',
        prompt: imagePrompt,
        config: {
            responseModalities: ['TEXT', 'IMAGE'],
        },
    });

    if (!media?.url) {
      return { diagramUrl: null };
    }
    
    return { diagramUrl: media.url };
  } catch (error) {
    console.error("Diagram generation AI call failed:", error);
    return { diagramUrl: null };
  }
}
