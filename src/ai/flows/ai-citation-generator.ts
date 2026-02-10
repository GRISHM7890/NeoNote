
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const CitationSchema = z.object({
  sourceType: z.string(),
  formattedCitation: z.string(),
  verificationNotes: z.string(),
});

const GenerateCitationsOutputSchema = z.object({
  citations: z.array(CitationSchema),
});
export type GenerateCitationsOutput = z.infer<typeof GenerateCitationsOutputSchema>;

export type GenerateCitationsInput = {
  text: string;
  style: 'MLA' | 'APA' | 'Chicago' | 'Harvard';
};

export async function generateCitations(input: GenerateCitationsInput): Promise<GenerateCitationsOutput> {
  const prompt = `
Identify and format citations in ${input.style} style from:
---
${input.text}
---
`;

  return runStructuredPrompt(prompt, GenerateCitationsOutputSchema);
}
