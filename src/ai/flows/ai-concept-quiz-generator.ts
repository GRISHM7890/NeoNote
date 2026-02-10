
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const QuizItemSchema = z.object({
  question: z.string(),
  modelAnswer: z.string()
});

const GenerateConceptQuizOutputSchema = z.object({
  questions: z.array(QuizItemSchema),
});
export type GenerateConceptQuizOutput = z.infer<typeof GenerateConceptQuizOutputSchema>;

export type GenerateConceptQuizInput = {
  notes: string;
};

export async function generateConceptQuiz(input: GenerateConceptQuizInput): Promise<GenerateConceptQuizOutput> {
  const prompt = `
Generate 3-5 conceptual questions and answers from these notes:
---
${input.notes}
---
`;

  return runStructuredPrompt(prompt, GenerateConceptQuizOutputSchema);
}
