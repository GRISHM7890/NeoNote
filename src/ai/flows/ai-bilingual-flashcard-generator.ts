
'use server';
/**
 * @fileOverview AI flow to generate bilingual flashcards.
 *
 * This flow takes a list of flashcards in a source language and translates them
 * to a target language, creating a set of bilingual cards.
 *
 * - generateBilingualFlashcards - The main function to orchestrate the generation.
 * - GenerateBilingualFlashcardsInput - The input type for the flow.
 * - GenerateBilingualFlashcardsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const CardSchema = z.object({
  term: z.string().describe("The term in the source language."),
  definition: z.string().describe("The definition in the source language."),
});

export type GenerateBilingualFlashcardsInput = z.infer<typeof GenerateBilingualFlashcardsInputSchema>;
const GenerateBilingualFlashcardsInputSchema = z.object({
  cards: z.array(CardSchema).describe("An array of flashcards to be translated."),
  targetLanguage: z.string().describe("The language to translate the cards into (e.g., 'Hindi', 'Spanish')."),
});

const BilingualCardSchema = z.object({
  sourceTerm: z.string().describe("The original term."),
  sourceDefinition: z.string().describe("The original definition."),
  translatedTerm: z.string().describe("The term translated into the target language."),
  translatedDefinition: z.string().describe("The definition translated into the target language."),
});

export type GenerateBilingualFlashcardsOutput = z.infer<typeof GenerateBilingualFlashcardsOutputSchema>;
const GenerateBilingualFlashcardsOutputSchema = z.object({
  bilingualCards: z.array(BilingualCardSchema).describe("An array of the generated bilingual flashcards."),
});


// 2. Define the AI prompt for translation
const generateBilingualCardsPrompt = ai.definePrompt({
  name: 'generateBilingualCardsPrompt',
  input: { schema: GenerateBilingualFlashcardsInputSchema },
  output: { schema: GenerateBilingualFlashcardsOutputSchema },
  prompt: `You are an expert multilingual translator. Your task is to translate a list of flashcards into a specified target language.

**Target Language:** {{{targetLanguage}}}

**Flashcards to Translate:**
---
{{{json cards}}}
---

**Instructions:**
1.  For each card object in the input array, translate the 'term' and 'definition' fields into the **{{{targetLanguage}}}**.
2.  Maintain the original source text.
3.  Construct a new array of objects, where each object contains the original source term and definition, as well as the newly translated term and definition.
4.  The output keys must be 'sourceTerm', 'sourceDefinition', 'translatedTerm', and 'translatedDefinition'.

Return the result as a single JSON object containing the 'bilingualCards' array.
`,
});

// 3. Define the main flow
const generateBilingualFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateBilingualFlashcardsFlow',
    inputSchema: GenerateBilingualFlashcardsInputSchema,
    outputSchema: GenerateBilingualFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await generateBilingualCardsPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate bilingual flashcards. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateBilingualFlashcards(input: GenerateBilingualFlashcardsInput): Promise<GenerateBilingualFlashcardsOutput> {
  return generateBilingualFlashcardsFlow(input);
}
