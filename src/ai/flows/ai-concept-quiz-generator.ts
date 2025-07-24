
'use server';
/**
 * @fileOverview AI flow to generate conceptual questions and model answers from a block of text.
 *
 * This flow is designed to help users test their deep understanding of their own notes
 * by generating open-ended, thought-provoking questions and providing ideal answers.
 *
 * - generateConceptQuiz - The main function to orchestrate the quiz generation.
 * - GenerateConceptQuizInput - The input type for the flow.
 * - GenerateConceptQuizOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type GenerateConceptQuizInput = z.infer<typeof GenerateConceptQuizInputSchema>;
const GenerateConceptQuizInputSchema = z.object({
  notes: z.string().describe("The user's study notes or a block of text to be analyzed."),
});


const QuizItemSchema = z.object({
    question: z.string().describe("An open-ended, thought-provoking conceptual question based on the provided text."),
    modelAnswer: z.string().describe("A comprehensive, ideal 'god-tier' answer to the question.")
});

export type GenerateConceptQuizOutput = z.infer<typeof GenerateConceptQuizOutputSchema>;
const GenerateConceptQuizOutputSchema = z.object({
  questions: z.array(QuizItemSchema).describe('An array of 3-5 question-answer pairs.'),
});

// 2. Define the AI prompt for quiz generation
const generateQuizPrompt = ai.definePrompt({
  name: 'generateConceptQuizPrompt',
  input: { schema: GenerateConceptQuizInputSchema },
  output: { schema: GenerateConceptQuizOutputSchema },
  prompt: `You are an expert educator who excels at creating insightful, open-ended conceptual questions and perfect model answers. Your goal is to help students think critically about the material they've written.

**Source Material (Student's Notes):**
---
{{{notes}}}
---

**Your Task:**
1.  Read the provided source material carefully.
2.  Identify the core concepts, principles, and underlying themes.
3.  Generate an array of 3 to 5 thought-provoking, open-ended questions that test for deep understanding, not just rote memorization.
4.  For EACH question you generate, you MUST also write a comprehensive, "god-tier" model answer. This answer should be what a top student would write in an exam, explaining the concept thoroughly.
5.  The questions should encourage the student to explain, compare, contrast, or evaluate the concepts.

**Example question/answer pair:**
- "question": "How does the process of photosynthesis directly relate to cellular respiration?"
- "modelAnswer": "Photosynthesis and cellular respiration are two fundamental processes that are essentially the reverse of each other. Photosynthesis uses carbon dioxide, water, and light energy to produce glucose (chemical energy) and oxygen. Cellular respiration, on the other hand, uses that glucose and oxygen to produce carbon dioxide, water, and ATP (usable cellular energy). They form a critical cycle where the outputs of one process are the inputs for the other, ensuring the continuous flow of energy through most ecosystems."

Return the questions and their model answers in the specified JSON format.
`,
});

// 3. Define the main flow
const generateConceptQuizFlow = ai.defineFlow(
  {
    name: 'generateConceptQuizFlow',
    inputSchema: GenerateConceptQuizInputSchema,
    outputSchema: GenerateConceptQuizOutputSchema,
  },
  async (input) => {
    const { output } = await generateQuizPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a concept quiz. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateConceptQuiz(input: GenerateConceptQuizInput): Promise<GenerateConceptQuizOutput> {
  return generateConceptQuizFlow(input);
}
