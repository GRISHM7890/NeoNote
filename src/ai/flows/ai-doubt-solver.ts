'use server';
/**
 * @fileOverview AI-powered flow for solving student doubts.
 *
 * - solveDoubt - A function that provides an expert explanation for a user's question.
 * - SolveDoubtInput - The input type for the solveDoubt function.
 * - SolveDoubtOutput - The return type for the solveDoubt function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const SolveDoubtInputSchema = z.object({
  query: z.string().describe("The user's question or doubt."),
  photoDataUri: z.string().optional().describe(
    "An optional photo of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type SolveDoubtInput = z.infer<typeof SolveDoubtInputSchema>;

const SolveDoubtOutputSchema = z.object({
  explanation: z.string().describe("A detailed, step-by-step explanation that answers the user's doubt."),
  relatedConcepts: z.array(z.string()).optional().describe('A list of related concepts for further study.'),
});
export type SolveDoubtOutput = z.infer<typeof SolveDoubtOutputSchema>;

export async function solveDoubt(input: SolveDoubtInput): Promise<SolveDoubtOutput> {
  return solveDoubtFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveDoubtPrompt',
  input: { schema: SolveDoubtInputSchema },
  output: { schema: SolveDoubtOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  system: `You are a world-class AI tutor for students preparing for competitive exams like JEE and NEET. Your primary goal is to provide clear, detailed, and step-by-step explanations to their doubts. Never just give the answer. Always explain the underlying concepts and the process to arrive at the solution.

Your Task:
1.  **Analyze the Doubt:** Carefully analyze the user's question and any provided image.
2.  **Provide a Step-by-Step Explanation:** Craft a detailed, easy-to-follow explanation. Break down complex problems into smaller steps. For math or physics problems, explain each step of the calculation. For conceptual questions, define the key terms and explain the principles involved.
3.  **Identify Related Concepts:** List a few related topics or concepts that the user might want to study to strengthen their understanding of this area.
4.  **Maintain a Supportive Tone:** Be encouraging and supportive. Your goal is to build the student's confidence.

Return the result in the specified JSON format. The 'explanation' should be comprehensive.`,
  prompt: `User's Doubt:
- **Question:** {{{query}}}
{{#if photoDataUri}}
- **Image of the problem:** {{media url=photoDataUri}}
{{/if}}`,
});

const solveDoubtFlow = ai.defineFlow(
  {
    name: 'solveDoubtFlow',
    inputSchema: SolveDoubtInputSchema,
    outputSchema: SolveDoubtOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
        throw new Error("The AI failed to generate a response that matched the required format. Please try rephrasing your question.");
    }
    return output;
  }
);
