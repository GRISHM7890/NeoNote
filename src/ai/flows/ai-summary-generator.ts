
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const GenerateSummaryInputSchema = z.object({
  text: z.string(),
  studyLevel: z.enum(['simple', 'advanced']),
  goal: z.string(),
  outputFormat: z.string(),
});
export type GenerateSummaryInput = z.infer<typeof GenerateSummaryInputSchema>;

const GenerateSummaryOutputSchema = z.object({
  title: z.string().optional(),
  content: z.string(),
  keywords: z.array(z.string()).optional(),
});
export type GenerateSummaryOutput = z.infer<typeof GenerateSummaryOutputSchema>;

export async function generateSummary(input: GenerateSummaryInput): Promise<GenerateSummaryOutput> {
  const prompt = `
You are a world-class AI specializing in creating personalized academic summaries.
**User Preferences:**
- Study Level: ${input.studyLevel}
- Learning Goal: ${input.goal}
- Output Format: ${input.outputFormat}

**Source Text:**
---
${input.text}
---

**Your Tasks:**
1. Generate a suitable title.
2. Write the summary content based on preferences.
3. Extract important keywords.
`;

  return runStructuredPrompt(prompt, GenerateSummaryOutputSchema);
}
