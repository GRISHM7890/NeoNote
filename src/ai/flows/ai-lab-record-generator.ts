
'use server';
/**
 * @fileOverview AI-powered lab record generation flow.
 *
 * - generateLabRecord - A function that generates a complete lab practical write-up.
 * - GenerateLabRecordInput - The input type for the generateLabRecord function.
 * - GenerateLabRecordOutput - The return type for the generateLabRecord function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateLabRecordInputSchema = z.object({
  experimentName: z.string().describe('The name or title of the lab experiment.'),
  subject: z.string().describe('The subject of the experiment (e.g., "Physics", "Chemistry", "Biology").'),
  className: z.string().describe('The class or grade level for which the experiment is intended (e.g., "Class 12").'),
  board: z.string().optional().describe('The educational board to format for, if any (e.g., "CBSE", "ICSE").'),
});
export type GenerateLabRecordInput = z.infer<typeof GenerateLabRecordInputSchema>;

const GenerateLabRecordOutputSchema = z.object({
  aim: z.string().describe('The main objective of the experiment.'),
  apparatus: z.array(z.string()).describe('A list of all apparatus and materials required.'),
  theory: z.string().describe('The underlying scientific theory and principles behind the experiment.'),
  procedure: z.array(z.string()).describe('A step-by-step procedure to conduct the experiment.'),
  observation: z.string().describe('A description of expected observations, including any tables needed for recording data.'),
  result: z.string().describe('The expected result or conclusion of the experiment.'),
  precautions: z.array(z.string()).describe('A list of safety precautions to be taken during the experiment.'),
});
export type GenerateLabRecordOutput = z.infer<typeof GenerateLabRecordOutputSchema>;

export async function generateLabRecord(input: GenerateLabRecordInput): Promise<GenerateLabRecordOutput> {
  return generateLabRecordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLabRecordPrompt',
  input: { schema: GenerateLabRecordInputSchema },
  output: { schema: GenerateLabRecordOutputSchema },
  prompt: `You are an expert science teacher and lab assistant for {{className}}. Your task is to create a detailed, well-structured write-up for a lab experiment.

**Experiment Details:**
- **Experiment Name:** {{experimentName}}
- **Subject:** {{subject}}
- **Class:** {{className}}
{{#if board}}
- **Educational Board:** {{board}} (Align the format and content with the standards of this board)
{{/if}}

**Instructions:**
Generate a complete lab record write-up with the following sections. Be clear, concise, and scientifically accurate.

1.  **aim**: State the objective of the experiment clearly.
2.  **apparatus**: List all required apparatus, chemicals, and materials.
3.  **theory**: Explain the scientific principles and formulas relevant to the experiment. This section should be detailed.
4.  **procedure**: Provide a clear, step-by-step list of instructions to perform the experiment.
5.  **observation**: Describe what should be observed. If applicable, create a template for an observation table in a structured format (e.g., using markdown for the table).
6.  **result**: State the expected conclusion or final result of the experiment.
7.  **precautions**: List important safety measures and precautions to be followed.

Ensure the language and complexity are appropriate for a {{className}} student. Return the result in the specified JSON format.`,
});

const generateLabRecordFlow = ai.defineFlow(
  {
    name: 'generateLabRecordFlow',
    inputSchema: GenerateLabRecordInputSchema,
    outputSchema: GenerateLabRecordOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
