
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const GenerateLabRecordOutputSchema = z.object({
  aim: z.string(),
  apparatus: z.array(z.string()),
  theory: z.string(),
  procedure: z.array(z.string()),
  observation: z.string(),
  result: z.string(),
  precautions: z.array(z.string()),
});
export type GenerateLabRecordOutput = z.infer<typeof GenerateLabRecordOutputSchema>;

export type GenerateLabRecordInput = {
  experimentName: string;
  subject: string;
  className: string;
  board?: string;
};

export async function generateLabRecord(input: GenerateLabRecordInput): Promise<GenerateLabRecordOutput> {
  const prompt = `
Generate a lab record for:
Experiment: ${input.experimentName}
Subject: ${input.subject}
Class: ${input.className}
Board: ${input.board || ""}
`;

  return runStructuredPrompt(prompt, GenerateLabRecordOutputSchema);
}
