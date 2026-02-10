
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const ProcessBlurtOutputSchema = z.object({
  recallScore: z.number().int().min(0).max(100),
  keyConceptsMentioned: z.array(z.string()),
  keyConceptsMissed: z.array(z.string()),
  feedback: z.string(),
});
export type ProcessBlurtOutput = z.infer<typeof ProcessBlurtOutputSchema>;

export type ProcessBlurtInput = {
  topic: string;
  blurtText: string;
};

export async function processBlurt(input: ProcessBlurtInput): Promise<ProcessBlurtOutput> {
  const prompt = `
Analyze this blurt for topic: ${input.topic}
Text: ${input.blurtText}

Structure:
{
  "recallScore": 0-100,
  "keyConceptsMentioned": [],
  "keyConceptsMissed": [],
  "feedback": "..."
}
`;

  return runStructuredPrompt(prompt, ProcessBlurtOutputSchema);
}
