
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const GenerateSmartTipOutputSchema = z.object({
  tipTitle: z.string(),
  tipContent: z.string(),
  rationale: z.string(),
});
export type GenerateSmartTipOutput = z.infer<typeof GenerateSmartTipOutputSchema>;

export type GenerateSmartTipInput = {
  subject?: string;
  challenge: string;
};

export async function generateSmartTip(input: GenerateSmartTipInput): Promise<GenerateSmartTipOutput> {
  const prompt = `
Generate a learning coach tip for:
Challenge: ${input.challenge}
Subject: ${input.subject || "General"}
`;

  return runStructuredPrompt(prompt, GenerateSmartTipOutputSchema);
}
