
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const GenerateRevisionScheduleOutputSchema = z.object({
  schedule: z.array(z.object({
    day: z.number().int(),
    topic: z.string(),
  })),
});
export type GenerateRevisionScheduleOutput = z.infer<typeof GenerateRevisionScheduleOutputSchema>;

export type GenerateRevisionScheduleInput = {
  topics: string[];
  totalDays: number;
};

export async function generateRevisionSchedule(input: GenerateRevisionScheduleInput): Promise<GenerateRevisionScheduleOutput> {
  const prompt = `
Generate a spaced repetition schedule for ${input.totalDays} days for these topics:
${input.topics.join(", ")}
Standard intervals: Day 2, 4, 8, 16, 32...
`;

  return runStructuredPrompt(prompt, GenerateRevisionScheduleOutputSchema);
}
