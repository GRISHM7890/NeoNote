
'use server';

import { runStructuredVisionPrompt } from '@/ai/bytez';
import { z } from 'zod';

const SolveEquationOutputSchema = z.object({
  problemStatement: z.string(),
  solutionSteps: z.array(z.string()),
  finalAnswer: z.string(),
  explanation: z.string(),
  relatedConcepts: z.array(z.string()).optional(),
});
export type SolveEquationOutput = z.infer<typeof SolveEquationOutputSchema>;

export type SolveEquationInput = {
  subject: 'Mathematics' | 'Chemistry';
  photoDataUri: string;
};

export async function solveEquation(input: SolveEquationInput): Promise<SolveEquationOutput> {
  const prompt = `
Solve this ${input.subject} problem from the image.
Use LaTeX for all mathematical and chemical notation.
`;

  return runStructuredVisionPrompt(prompt, input.photoDataUri, SolveEquationOutputSchema);
}
