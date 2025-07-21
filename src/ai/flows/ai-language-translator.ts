'use server';
/**
 * @fileOverview AI flow to translate text into a specified language.
 *
 * This flow takes a block of text and a target language and uses AI to provide
 * an accurate translation.
 *
 * - translateText - The main function to orchestrate the translation.
 * - TranslateTextInput - The input type for the flow.
 * - TranslateTextOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;
const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe("The target language for translation (e.g., 'Hindi', 'Marathi', 'Spanish')."),
});

export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;
const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe('The translated text.'),
  detectedSourceLanguage: z.string().optional().describe('The automatically detected source language of the input text.'),
});

// 2. Define the AI prompt for translation
const translatePrompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `You are an expert language translator. Your task is to translate the given text into the specified target language.

**Instructions:**
1.  Read the source text carefully.
2.  Automatically detect the source language.
3.  Translate the text into the target language: **{{{targetLanguage}}}**.
4.  Ensure the translation is natural and accurate.

**Source Text:**
---
{{{text}}}
---

Return the result in the specified JSON format. Provide ONLY the translated text in the 'translatedText' field and the detected source language in the 'detectedSourceLanguage' field.
`,
});

// 3. Define the main flow
const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await translatePrompt(input);
    if (!output) {
      throw new Error('The AI failed to translate the text. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}
