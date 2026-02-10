
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const TranslateTextInputSchema = z.object({
  text: z.string(),
  targetLanguage: z.string(),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string(),
  detectedSourceLanguage: z.string().optional(),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  const prompt = `
Translate the following text into ${input.targetLanguage}:
---
${input.text}
---
`;

  return runStructuredPrompt(prompt, TranslateTextOutputSchema);
}
