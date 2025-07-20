
'use server';
/**
 * @fileOverview AI-powered summary generation flow with personalization.
 *
 * - generateSummary - A function that generates a summary based on user input and preferences.
 * - GenerateSummaryInput - The input type for the generateSummary function.
 * - GenerateSummaryOutput - The return type for the generateSummary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const GenerateSummaryInputSchema = z.object({
  text: z.string().describe('The source text to be summarized.'),
  studyLevel: z
    .enum(['simple', 'advanced'])
    .describe('The academic level of the user (e.g., "Simple" for primary, "Advanced" for competitive exams).'),
  goal: z
    .string()
    .describe('The user\'s primary goal for the summary (e.g., "Quick Review", "Deep Understanding", "Exam Preparation").'),
  outputFormat: z
    .string()
    .describe('The desired format for the summary (e.g., "Paragraph", "Bullet Points", "Key Takeaways").'),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;


export const GenerateSummaryOutputSchema = z.object({
  title: z.string().optional().describe('A concise, relevant title for the summary.'),
  content: z.string().describe('The main body of the generated summary.'),
  keywords: z.array(z.string()).optional().describe('A list of important keywords from the text.'),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  return generateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSummaryPrompt',
  input: { schema: GenerateSummaryInputSchema },
  output: { schema: GenerateSummaryOutputSchema },
  prompt: `You are a world-class AI specializing in creating personalized academic summaries. Your task is to generate a summary based on the provided text and user preferences.

**User Preferences:**
- **Study Level:** {{{studyLevel}}}
  - If 'simple', explain concepts in a very basic, easy-to-understand manner suitable for a primary or middle school student. Use analogies and simple language.
  - If 'advanced', use precise terminology and expect a higher level of prior knowledge, suitable for a student preparing for competitive exams like JEE or NEET. Focus on depth and nuanced details.
- **Learning Goal:** {{{goal}}}
  - If 'Quick Review', create a concise overview of the main points.
  - If 'Deep Understanding', provide a more detailed explanation, including the relationships between concepts.
  - If 'Exam Preparation', focus on definitions, key formulas, and points that are likely to be on a test.
- **Output Format:** {{{outputFormat}}}
  - Structure the output as a clean {{outputFormat}}. If 'Key Takeaways', present the most crucial points in a brief list.

**Source Text:**
---
{{{text}}}
---

**Your Tasks:**
1.  Read and understand the source text.
2.  Generate a suitable title for the summary.
3.  Write the summary content, strictly adhering to all user preferences for level, goal, and format.
4.  Extract a list of the most important keywords.
5.  Return the result in the specified JSON format.
`,
});

const generateSummaryFlow = ai.defineFlow(
  {
    name: 'generateSummaryFlow',
    inputSchema: GenerateSummaryInputSchema,
    outputSchema: GenerateSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
