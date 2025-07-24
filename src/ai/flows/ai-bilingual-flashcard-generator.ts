
'use server';
/**
 * @fileOverview AI flow to generate bilingual flashcards from a topic.
 *
 * This flow takes a topic and a target language, generates relevant flashcards
 * in English, and then translates them.
 *
 * - generateBilingualFlashcards - The main function to orchestrate the generation.
 * - GenerateBilingualFlashcardsInput - The input type for the flow.
 * - GenerateBilingualFlashcardsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas
export type GenerateBilingualFlashcardsInput = z.infer<typeof GenerateBilingualFlashcardsInputSchema>;
const GenerateBilingualFlashcardsInputSchema = z.object({
  topic: z.string().describe("The topic to generate flashcards about (e.g., 'Photosynthesis')."),
  questionCount: z.number().int().min(1).max(15).describe("The number of flashcards to generate."),
  targetLanguage: z.string().describe("The language to translate the cards into (e.g., 'Hindi', 'Spanish')."),
});

const BilingualCardSchema = z.object({
  sourceTerm: z.string().describe("The original term in English."),
  sourceDefinition: z.string().describe("The original definition in English."),
  translatedTerm: z.string().describe("The term translated into the target language."),
  translatedDefinition: z.string().describe("The definition translated into the target language."),
});

export type GenerateBilingualFlashcardsOutput = z.infer<typeof GenerateBilingualFlashcardsOutputSchema>;
const GenerateBilingualFlashcardsOutputSchema = z.object({
  bilingualCards: z.array(BilingualCardSchema).describe("An array of the generated bilingual flashcards."),
});


// 2. Define the AI prompt for generation and translation
const generateBilingualCardsPrompt = ai.definePrompt({
  name: 'generateBilingualCardsPrompt',
  input: { schema: GenerateBilingualFlashcardsInputSchema },
  output: { schema: GenerateBilingualFlashcardsOutputSchema },
  prompt: `You are an expert educator and multilingual translator. Your task is to first create a set of educational flashcards on a given topic in English, and then translate them into a specified target language.

**Topic:** {{{topic}}}
**Number of Flashcards to Generate:** {{questionCount}}
**Target Language for Translation:** {{{targetLanguage}}}

**Instructions (Follow these steps precisely):**

1.  **Generate English Flashcards:**
    *   First, act as an expert educator. Based on the "{{{topic}}}", generate exactly {{questionCount}} key terms and their clear, concise definitions in **English**.
    *   These should be fundamental concepts related to the topic.

2.  **Translate to Target Language:**
    *   Next, act as an expert translator. Translate each of the English terms and definitions you just generated into **{{{targetLanguage}}}**.
    *   Ensure the translations are accurate and contextually appropriate.

3.  **Format the Output:**
    *   For each flashcard, create a JSON object containing the original English content and the new translated content.
    *   The output keys must be 'sourceTerm', 'sourceDefinition', 'translatedTerm', and 'translatedDefinition'.
    *   Compile all of these objects into a single 'bilingualCards' array.

Return the result as a single JSON object.
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
