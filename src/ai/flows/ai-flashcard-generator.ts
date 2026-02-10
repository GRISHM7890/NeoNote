
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const FlashcardSchema = z.object({
  term: z.string(),
  definition: z.string(),
});

const MultipleChoiceQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema),
  multipleChoiceQuestions: z.array(MultipleChoiceQuestionSchema),
  coreConcepts: z.array(z.string()),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export type GenerateFlashcardsInput = {
  notes: string;
  topic: string;
};

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  const prompt = `
Generate flashcards, MCQs, and core concepts for topic: ${input.topic}
Notes: ${input.notes}
`;

  return runStructuredPrompt(prompt, GenerateFlashcardsOutputSchema);
}
