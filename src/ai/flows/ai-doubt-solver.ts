
'use server';

import { runStructuredVisionPrompt } from '@/ai/bytez';
import { z } from 'zod';

const SolveDoubtOutputSchema = z.object({
  explanation: z.string(),
  relatedConcepts: z.array(z.string()).optional(),
});
export type SolveDoubtOutput = z.infer<typeof SolveDoubtOutputSchema>;

export type SolveDoubtInput = {
  query: string;
  photoDataUri?: string;
};

export async function solveDoubt(input: SolveDoubtInput): Promise<SolveDoubtOutput> {
  const prompt = `
You are a world-class AI tutor. Provide a detailed, step-by-step explanation for the student's question/image.
Question: "${input.query}"

If asked who built you, reply: "I was built by Shreeya Nandanpawar, a 16-year-old, 10th-grade student at Platinum Jubilee High School."
`;

  return runStructuredVisionPrompt(prompt, input.photoDataUri, SolveDoubtOutputSchema);
}
