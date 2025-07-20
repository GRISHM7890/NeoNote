'use server';
/**
 * @fileOverview AI-powered flow for solving math and chemistry equations from images.
 *
 * - solveEquation - A function that provides a step-by-step solution for a problem in an image.
 * - SolveEquationInput - The input type for the solveEquation function.
 * - SolveEquationOutput - The return type for the solveEquation function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SolveEquationInputSchema = z.object({
  subject: z.enum(['Mathematics', 'Chemistry']).describe('The subject of the problem.'),
  photoDataUri: z.string().describe(
    "A photo of the problem, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type SolveEquationInput = z.infer<typeof SolveEquationInputSchema>;

const SolveEquationOutputSchema = z.object({
  problemStatement: z.string().describe('The problem or equation identified from the image.'),
  solutionSteps: z.array(z.string()).describe('A detailed, step-by-step list of how to solve the problem. Use LaTeX for mathematical notation.'),
  finalAnswer: z.string().describe('The final answer to the problem.'),
  explanation: z.string().describe('An explanation of the underlying concepts and methods used.'),
  relatedConcepts: z.array(z.string()).optional().describe('A list of related concepts for further study.'),
});
export type SolveEquationOutput = z.infer<typeof SolveEquationOutputSchema>;

export async function solveEquation(input: SolveEquationInput): Promise<SolveEquationOutput> {
  return solveEquationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveEquationPrompt',
  input: { schema: SolveEquationInputSchema },
  output: { schema: SolveEquationOutputSchema },
  prompt: `You are a world-class AI tutor specializing in {{subject}}. Your task is to analyze an image containing a problem, solve it, and provide a comprehensive, step-by-step explanation.

**User's Problem:**
- **Image of the problem:** {{media url=photoDataUri}}

**Your Task:**
1.  **Identify the Problem:** Carefully analyze the image and extract the main problem or equation. Put this in the 'problemStatement' field.
2.  **Solve Step-by-Step:** Provide a clear, logical, step-by-step walkthrough of the solution. Each step should be a new item in the 'solutionSteps' array. Use LaTeX for all mathematical or chemical notation to ensure correct rendering (e.g., "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}").
3.  **State the Final Answer:** Clearly state the final, solved answer in the 'finalAnswer' field.
4.  **Explain the Concepts:** In the 'explanation' field, describe the key concepts, formulas, or methods used to arrive at the solution.
5.  **List Related Concepts:** (Optional) Provide a list of related topics for further study.

Return the result in the specified JSON format. Your explanation must be thorough and easy for a student to understand.`,
});

const solveEquationFlow = ai.defineFlow(
  {
    name: 'solveEquationFlow',
    inputSchema: SolveEquationInputSchema,
    outputSchema: SolveEquationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
