
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const FormulaSchema = z.object({
  name: z.string(),
  formula: z.string(),
  explanation: z.string(),
  derivation: z.array(z.string()).optional(),
});

const GenerateFormulasOutputSchema = z.object({
  formulas: z.array(FormulaSchema),
});
export type GenerateFormulasOutput = z.infer<typeof GenerateFormulasOutputSchema>;

export type GenerateFormulasInput = {
  subject: string;
  topic: string;
};

export async function generateFormulas(input: GenerateFormulasInput): Promise<GenerateFormulasOutput> {
  const prompt = `
Generate key formulas for:
Subject: ${input.subject}
Topic: ${input.topic}
Use LaTeX format.
`;

  return runStructuredPrompt(prompt, GenerateFormulasOutputSchema);
}
