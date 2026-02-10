
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const TopicQuestionsSchema = z.object({
  topicName: z.string(),
  description: z.string(),
  multipleChoiceQuestions: z.array(z.object({
    question: z.string(),
    options: z.array(z.string()).length(4),
    correctAnswer: z.string(),
  })),
  shortAnswerQuestions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  }))
});

const ReferenceBookOutputSchema = z.object({
  difficulty: z.string(),
  topicsWithQuestions: z.array(TopicQuestionsSchema),
});
export type ReferenceBookOutput = z.infer<typeof ReferenceBookOutputSchema>;

export type ReferenceBookInput = {
  bookTitle: string;
  author?: string;
};

export async function analyzeReferenceBook(input: ReferenceBookInput): Promise<ReferenceBookOutput> {
  const prompt = `
Analyze this book and generate study questions:
Title: ${input.bookTitle}
Author: ${input.author || ""}
`;

  return runStructuredPrompt(prompt, ReferenceBookOutputSchema);
}
