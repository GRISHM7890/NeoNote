'use server';
/**
 * @fileOverview AI-powered flashcard generation flow.
 *
 * - generateFlashcards - A function that generates flashcards from input notes.
 * - GenerateFlashcardsInput - The input type for the generateFlashcards function.
 * - GenerateFlashcardsOutput - The return type for the generateFlashcards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateFlashcardsInputSchema = z.object({
  notes: z
    .string()
    .describe('The notes from which to generate flashcards.'),
  topic: z.string().describe('The specific topic for flashcard generation.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const FlashcardSchema = z.object({
  term: z.string().describe('The term or concept to be defined.'),
  definition: z.string().describe('The definition of the term.'),
});

const MultipleChoiceQuestionSchema = z.object({
  question: z.string().describe('The multiple choice question.'),
  options: z.array(z.string()).describe('The possible answers.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
});

const CoreConceptSchema = z.string().describe('A core concept related to the topic.');

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('Generated flashcards with terms and definitions.'),
  multipleChoiceQuestions: z
    .array(MultipleChoiceQuestionSchema)
    .describe('Generated multiple choice questions.'),
  coreConcepts: z.array(CoreConceptSchema).describe('List of core concepts.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(input: GenerateFlashcardsInput): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: {schema: GenerateFlashcardsInputSchema},
  output: {schema: GenerateFlashcardsOutputSchema},
  prompt: `You are an AI flashcard generator. You will generate flashcards, multiple choice questions, and core concepts based on the notes provided.

Notes: {{{notes}}}
Topic: {{{topic}}}

Flashcards should include a term and a definition.
Multiple choice questions should include a question, options, and the correct answer.
Core concepts should be a list of the most important concepts related to the topic.

Ensure the output is well-formatted and easy to understand.

Output the results in JSON format.`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
