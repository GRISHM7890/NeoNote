
'use server';
/**
 * @fileOverview AI-powered formula generation flow.
 *
 * - generateFormulas - A function that generates formulas for a given subject and topic.
 * - GenerateFormulasInput - The input type for the generateFormulas function.
 * - GenerateFormulasOutput - The return type for the generateFormulas function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateFormulasInputSchema = z.object({
  subject: z
    .string()
    .describe('The subject for which to generate formulas (e.g., "Physics").'),
  topic: z
    .string()
    .describe('The specific topic within the subject (e.g., "Kinematics").'),
});
export type GenerateFormulasInput = z.infer<typeof GenerateFormulasInputSchema>;

const FormulaSchema = z.object({
  name: z.string().describe('The common name of the formula (e.g., "Pythagorean Theorem").'),
  formula: z.string().describe('The formula represented in LaTeX format.'),
  explanation: z.string().describe('A clear explanation of what the formula represents and its variables.'),
  derivation: z.array(z.string()).optional().describe('A step-by-step derivation of the formula.'),
});

export const GenerateFormulasOutputSchema = z.object({
  formulas: z.array(FormulaSchema).describe('An array of generated formulas.'),
});
export type GenerateFormulasOutput = z.infer<typeof GenerateFormulasOutputSchema>;

export async function generateFormulas(input: GenerateFormulasInput): Promise<GenerateFormulasOutput> {
  return generateFormulasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFormulasPrompt',
  input: { schema: GenerateFormulasInputSchema },
  output: { schema: GenerateFormulasOutputSchema },
  prompt: `You are an expert in {{subject}} and a brilliant teacher. Your task is to provide a list of key formulas related to the topic of "{{topic}}".

For each formula, you must provide:
1.  **name**: The common name of the formula.
2.  **formula**: The mathematical representation of the formula, written strictly in LaTeX format. For example, for the quadratic formula, you would provide: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}".
3.  **explanation**: A detailed explanation of what the formula is used for, what each variable represents, and any relevant units or conditions.
4.  **derivation**: (Optional but highly recommended) A list of clear, step-by-step points explaining how the formula is derived.

Generate a comprehensive list of the most important formulas for the given topic. Return the result in the specified JSON format.
`,
});

const generateFormulasFlow = ai.defineFlow(
  {
    name: 'generateFormulasFlow',
    inputSchema: GenerateFormulasInputSchema,
    outputSchema: GenerateFormulasOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
