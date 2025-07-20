
'use server';
/**
 * @fileOverview AI flow to generate quiz questions for a flashcard battle.
 *
 * This flow takes user notes or a topic and generates a set of multiple-choice
 * questions designed for a quiz or "battle" format.
 *
 * - generateBattleQuestions - The main function to orchestrate question generation.
 * - GenerateBattleQuestionsInput - The input type for the flow.
 * - GenerateBattleQuestionsOutput - The return type for the flow.
 * - BattleQuestion - The schema for a single battle question.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const GenerateBattleQuestionsInputSchema = z.object({
  notes: z.string().optional().describe('The user-provided notes or text to base the questions on.'),
  topic: z.string().optional().describe('A topic to generate questions about if no notes are provided.'),
  questionCount: z.number().int().min(1).max(20).describe('The number of questions to generate.'),
});
export type GenerateBattleQuestionsInput = z.infer<typeof GenerateBattleQuestionsInputSchema>;

const BattleQuestionSchema = z.object({
  question: z.string().describe("The quiz question, derived from a key concept in the notes."),
  options: z.array(z.string()).length(4).describe("An array of 4 plausible options. One must be the correct answer."),
  correctAnswer: z.string().describe("The correct answer from the options."),
});
export type BattleQuestion = z.infer<typeof BattleQuestionSchema>;

const GenerateBattleQuestionsOutputSchema = z.object({
  questions: z.array(BattleQuestionSchema).describe('An array of generated battle questions.'),
});
export type GenerateBattleQuestionsOutput = z.infer<typeof GenerateBattleQuestionsOutputSchema>;


// 2. Define the AI prompt for question generation
const prompt = ai.definePrompt({
  name: 'generateBattleQuestionsPrompt',
  input: { schema: GenerateBattleQuestionsInputSchema },
  output: { schema: GenerateBattleQuestionsOutputSchema },
  prompt: `You are an expert exam creator for a competitive flashcard game. Your task is to create a set of challenging multiple-choice questions based on the provided text or topic.

**Source Material:**
{{#if notes}}
- **Notes:** {{{notes}}}
{{else if topic}}
- **Topic:** {{{topic}}}
{{/if}}

**Instructions:**
1.  Read the source material carefully and identify key facts, definitions, and concepts.
2.  Generate **EXACTLY** {{questionCount}} multiple-choice questions.
3.  For each question:
    -   The question should be clear and test a specific piece of knowledge.
    -   Create **four** plausible options. Three should be incorrect but related "distractors," and one must be the correct answer.
    -   The distractors should be tricky enough to make the user think.
4.  Ensure the correct answer is accurately identified.

Return the result in the specified JSON format.
`,
});

// 3. Define the main flow
const generateBattleQuestionsFlow = ai.defineFlow(
  {
    name: 'generateBattleQuestionsFlow',
    inputSchema: GenerateBattleQuestionsInputSchema,
    outputSchema: GenerateBattleQuestionsOutputSchema,
  },
  async (input) => {
     if (!input.notes && !input.topic) {
        throw new Error('Either notes or a topic must be provided.');
    }
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate battle questions. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateBattleQuestions(input: GenerateBattleQuestionsInput): Promise<GenerateBattleQuestionsOutput> {
  return generateBattleQuestionsFlow(input);
}
