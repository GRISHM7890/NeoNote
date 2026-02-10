
'use server';

import { imageModel } from '@/ai/bytez';
import { z } from 'zod';

export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;
const GenerateDiagramInputSchema = z.object({
  topic: z.string(),
});

export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;
const GenerateDiagramOutputSchema = z.object({
  diagramUrl: z.string().url().nullable(),
});

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  const imagePrompt = `A clear, visually appealing, educational diagram of '${input.topic}'. Modern, simple, vector illustration. White background. Legible English labels.`;

  try {
    const { error, output } = await imageModel.run([{
      role: "user",
      content: imagePrompt
    }]);

    if (error || !output) {
      console.error("Bytez Diagram Failed:", error);
      return { diagramUrl: null };
    }

    // Bytez output for image models might be a URL string or an object with a URL
    const url = typeof output === 'string' ? output : (output as any).url;
    return { diagramUrl: url || null };
  } catch (error) {
    console.error("Diagram generation AI call failed:", error);
    return { diagramUrl: null };
  }
}
