
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const SimulateRankOutputSchema = z.object({
  predictedPercentile: z.number().min(0).max(100),
  predictedRankRange: z.string(),
  analysis: z.string(),
});
export type SimulateRankOutput = z.infer<typeof SimulateRankOutputSchema>;

export type SimulateRankInput = {
  subject: string;
  scorePercentage: number;
  examType: 'Board Exams' | 'NEET' | 'JEE Main' | 'JEE Advanced';
};

export async function simulateRank(input: SimulateRankInput): Promise<SimulateRankOutput> {
  const prompt = `
Simulate exam rank for:
Exam: ${input.examType}
Subject: ${input.subject}
Score: ${input.scorePercentage}%
`;

  return runStructuredPrompt(prompt, SimulateRankOutputSchema);
}
