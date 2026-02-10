
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const GenerateFocusAmbianceOutputSchema = z.object({
  imagePrompt: z.string(),
  musicKeywords: z.array(z.string()),
  affirmations: z.array(z.string()),
});
export type GenerateFocusAmbianceOutput = z.infer<typeof GenerateFocusAmbianceOutputSchema>;

export type GenerateFocusAmbianceInput = {
  topic: string;
  mood: string;
  durationMinutes: number;
};

export async function generateFocusAmbiance(input: GenerateFocusAmbianceInput): Promise<GenerateFocusAmbianceOutput> {
  const prompt = `
Create focus ambiance for:
Topic: ${input.topic}
Mood: ${input.mood}
Duration: ${input.durationMinutes} mins
`;

  return runStructuredPrompt(prompt, GenerateFocusAmbianceOutputSchema);
}
