
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const ProcessQrNoteOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
});
export type ProcessQrNoteOutput = z.infer<typeof ProcessQrNoteOutputSchema>;

export type ProcessQrNoteInput = {
  text: string;
};

export async function processQrNote(input: ProcessQrNoteInput): Promise<ProcessQrNoteOutput> {
  const prompt = `
Process this text into a shareable note:
---
${input.text}
---
`;

  return runStructuredPrompt(prompt, ProcessQrNoteOutputSchema);
}
