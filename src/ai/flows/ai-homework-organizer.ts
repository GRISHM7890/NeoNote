
'use server';
/**
 * @fileOverview AI-powered flow for organizing homework assignments.
 *
 * - organizeHomework - A function that analyzes homework and categorizes it.
 * - OrganizeHomeworkInput - The input type for the organizeHomework function.
 * - OrganizeHomeworkOutput - The return type for the organizeHomework function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const OrganizeHomeworkInputSchema = z.object({
  dueDate: z.string().describe('The due date for the homework in ISO 8601 format (e.g., YYYY-MM-DD).'),
  inputText: z.string().optional().describe('The text description of the homework assignment.'),
  photoDataUri: z.string().optional().describe(
    "An optional photo of the homework, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
  ),
});
export type OrganizeHomeworkInput = z.infer<typeof OrganizeHomeworkInputSchema>;

const OrganizeHomeworkOutputSchema = z.object({
  subject: z.string().describe('The academic subject of the homework (e.g., "Physics", "History").'),
  taskSummary: z.string().describe('A concise, one-sentence summary of the main task.'),
  priority: z.enum(['High', 'Medium', 'Low']).describe('The priority level of the task based on its content and perceived effort.'),
});
export type OrganizeHomeworkOutput = z.infer<typeof OrganizeHomeworkOutputSchema>;

export async function organizeHomework(input: OrganizeHomeworkInput): Promise<OrganizeHomeworkOutput> {
  return organizeHomeworkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'organizeHomeworkPrompt',
  input: { schema: OrganizeHomeworkInputSchema },
  output: { schema: OrganizeHomeworkOutputSchema },
  prompt: `You are an expert at organizing student homework. Your task is to analyze the provided homework details and extract key information.

**Homework Information:**
{{#if inputText}}
- **Text:** {{{inputText}}}
{{/if}}
{{#if photoDataUri}}
- **Image of assignment:** {{media url=photoDataUri}}
{{/if}}
- **Due Date:** {{dueDate}}

**Your Instructions:**
1.  **Identify the Subject:** Determine the academic subject (e.g., Physics, History, Mathematics, Biology).
2.  **Summarize the Task:** Create a very brief, one-sentence summary of what the student needs to do.
3.  **Assess Priority:** Based on the type of task (e.g., "chapter questions" vs. "major project"), determine its priority. Use "High" for projects, essays, or large problem sets. Use "Medium" for standard homework. Use "Low" for simple or quick tasks.

Return the result in the specified JSON format.
`,
});

const organizeHomeworkFlow = ai.defineFlow(
  {
    name: 'organizeHomeworkFlow',
    inputSchema: OrganizeHomeworkInputSchema,
    outputSchema: OrganizeHomeworkOutputSchema,
  },
  async (input) => {
    if (!input.inputText && !input.photoDataUri) {
        throw new Error("Either text input or an image must be provided.");
    }
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to organize the homework. Please try again.');
    }
    return output;
  }
);
