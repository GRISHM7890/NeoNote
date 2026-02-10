
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const BattleQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
});

const GenerateBattleQuestionsOutputSchema = z.object({
  questions: z.array(BattleQuestionSchema),
});
export type GenerateBattleQuestionsOutput = z.infer<typeof GenerateBattleQuestionsOutputSchema>;

export type GenerateBattleQuestionsInput = {
  notes?: string;
  topic?: string;
  questionCount: number;
};

export async function generateBattleQuestions(input: GenerateBattleQuestionsInput): Promise<GenerateBattleQuestionsOutput> {
  const prompt = `
Generate ${input.questionCount} multiple-choice battle questions.
Source: ${input.notes || input.topic}

Structure:
{
  "questions": [
    { "question": "...", "options": ["a", "b", "c", "d"], "correctAnswer": "..." }
  ]
}
`;

  return runStructuredPrompt(prompt, GenerateBattleQuestionsOutputSchema);
}
