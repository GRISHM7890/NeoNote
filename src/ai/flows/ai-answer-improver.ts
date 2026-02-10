
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const ImproveAnswerInputSchema = z.object({
  question: z.string(),
  userAnswer: z.string(),
  subject: z.string(),
  examLevel: z.string(),
  totalMarks: z.number(),
});
export type ImproveAnswerInput = z.infer<typeof ImproveAnswerInputSchema>;

const ImproveAnswerOutputSchema = z.object({
  predictedScore: z.number(),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  detailedFeedback: z.string(),
  modelAnswer: z.string(),
});
export type ImproveAnswerOutput = z.infer<typeof ImproveAnswerOutputSchema>;

export async function improveAnswer(input: ImproveAnswerInput): Promise<ImproveAnswerOutput> {
  const prompt = `
You are a Master Examiner. Grade this answer:
- Subject: ${input.subject}
- Exam Level: ${input.examLevel}
- Question: ${input.question}
- Marks Allotted: ${input.totalMarks}

Student's Answer:
---
${input.userAnswer}
---
`;

  return runStructuredPrompt(prompt, ImproveAnswerOutputSchema);
}
