
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const BilingualCardSchema = z.object({
  sourceTerm: z.string(),
  sourceDefinition: z.string(),
  translatedTerm: z.string(),
  translatedDefinition: z.string(),
});

const GenerateBilingualFlashcardsOutputSchema = z.object({
  bilingualCards: z.array(BilingualCardSchema),
});
export type GenerateBilingualFlashcardsOutput = z.infer<typeof GenerateBilingualFlashcardsOutputSchema>;

export type GenerateBilingualFlashcardsInput = {
  topic: string;
  questionCount: number;
  targetLanguage: string;
};

export async function generateBilingualFlashcards(input: GenerateBilingualFlashcardsInput): Promise<GenerateBilingualFlashcardsOutput> {
  const prompt = `
Generate ${input.questionCount} bilingual flashcards for topic: ${input.topic}
Target Language: ${input.targetLanguage}

Structure:
{
  "bilingualCards": [
    { "sourceTerm": "Eng", "sourceDefinition": "Eng", "translatedTerm": "Lang", "translatedDefinition": "Lang" }
  ]
}
`;

  return runStructuredPrompt(prompt, GenerateBilingualFlashcardsOutputSchema);
}
