
'use server';
/**
 * @fileOverview AI flow to process a user's "blurt" session and provide a recall score.
 *
 * This flow analyzes a user's unstructured text about a topic and evaluates
 * their knowledge retention.
 *
 * - processBlurt - The main function to orchestrate the analysis.
 * - ProcessBlurtInput - The input type for the flow.
 * - ProcessBlurtOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const ProcessBlurtInputSchema = z.object({
  topic: z.string().describe('The topic the user is attempting to recall.'),
  blurtText: z.string().describe("The user's unstructured brain-dump of everything they remember about the topic."),
});
export type ProcessBlurtInput = z.infer<typeof ProcessBlurtInputSchema>;


const ProcessBlurtOutputSchema = z.object({
  recallScore: z.number().int().min(0).max(100).describe('A score from 0 to 100 representing the accuracy and completeness of the user\'s recall.'),
  keyConceptsMentioned: z.array(z.string()).describe('A list of the key concepts the user correctly mentioned.'),
  keyConceptsMissed: z.array(z.string()).describe('A list of important key concepts the user failed to mention.'),
  feedback: z.string().describe('Detailed, constructive feedback on the user\'s performance and suggestions for what to review.'),
});
export type ProcessBlurtOutput = z.infer<typeof ProcessBlurtOutputSchema>;

// 2. Define the AI prompt for analysis
const prompt = ai.definePrompt({
  name: 'processBlurtPrompt',
  input: { schema: ProcessBlurtInputSchema },
  output: { schema: ProcessBlurtOutputSchema },
  prompt: `You are an expert examiner testing a student's recall on a specific topic. Your task is to analyze the student's "blurt" (a brain dump of everything they remember) and evaluate it.

**Topic:** {{{topic}}}

**Student's Blurt:**
---
{{{blurtText}}}
---

**Instructions:**
1.  **Identify Key Concepts of the Topic:** First, internally determine the most important key concepts, facts, and definitions related to the '{{{topic}}}'. This forms your grading rubric.
2.  **Analyze the Blurt:** Compare the student's blurt against your rubric.
3.  **Calculate Recall Score:** Generate a score from 0-100. A score of 100 means they recalled everything perfectly. A score of 0 means they recalled nothing relevant. Base the score on the percentage of key concepts they recalled correctly.
4.  **List Concepts Mentioned:** Extract and list the key concepts the student successfully mentioned.
5.  **List Concepts Missed:** Identify and list the crucial concepts the student forgot. This is the most important part for their revision.
6.  **Provide Feedback:** Write a short, constructive paragraph. Start by acknowledging what they did well, then clearly point out the main areas they need to review based on the missed concepts.

Return the result in the specified JSON format.
`,
});

// 3. Define the main flow
const processBlurtFlow = ai.defineFlow(
  {
    name: 'processBlurtFlow',
    inputSchema: ProcessBlurtInputSchema,
    outputSchema: ProcessBlurtOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to process your blurt. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function processBlurt(input: ProcessBlurtInput): Promise<ProcessBlurtOutput> {
  return processBlurtFlow(input);
}
