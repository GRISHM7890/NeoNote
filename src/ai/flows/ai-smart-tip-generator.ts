
'use server';
/**
 * @fileOverview AI flow to generate a personalized study tip.
 *
 * This flow acts as an AI learning coach, providing a tailored tip
 * based on a student's specific subject and challenge.
 *
 * - generateSmartTip - The main function to orchestrate tip generation.
 * - GenerateSmartTipInput - The input type for the flow.
 * - GenerateSmartTipOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type GenerateSmartTipInput = z.infer<typeof GenerateSmartTipInputSchema>;
const GenerateSmartTipInputSchema = z.object({
  subject: z.string().optional().describe("The subject the student is currently studying (e.g., 'Physics', 'History')."),
  challenge: z.string().describe("The specific challenge the student is facing (e.g., 'Procrastination', 'Memorizing Formulas')."),
});

export type GenerateSmartTipOutput = z.infer<typeof GenerateSmartTipOutputSchema>;
const GenerateSmartTipOutputSchema = z.object({
  tipTitle: z.string().describe("A catchy, encouraging title for the study tip."),
  tipContent: z.string().describe("The detailed, actionable study tip tailored to the user's input. Should be a paragraph."),
  rationale: z.string().describe("A brief explanation of the psychological or pedagogical reason why this tip is effective for the given challenge."),
});


// 2. Define the AI prompt
const generateTipPrompt = ai.definePrompt({
  name: 'generateSmartTipPrompt',
  input: { schema: GenerateSmartTipInputSchema },
  output: { schema: GenerateSmartTipOutputSchema },
  prompt: `You are a world-class AI Learning and Motivation Coach. Your task is to provide a single, highly specific, and actionable study tip to a student based on their current challenge.

**Student's Situation:**
- **Studying:** {{{subject}}}
- **Challenge:** {{{challenge}}}

**Your Task (Follow these steps precisely):**

1.  **Analyze the Challenge:** Deeply consider the student's stated challenge. Is it a behavioral issue (like procrastination), a cognitive one (like understanding complexity), or a memory-related one?
2.  **Generate a Tip Title:** Create a short, catchy, and motivational title for your tip.
3.  **Craft the Tip Content:** Write a single, detailed paragraph explaining the tip. It must be practical and something the student can do *right now*. If the subject is 'General', provide a universal tip for the challenge. If a subject is specified, try to make the example in the tip relevant to that subject. For example, for "Memorizing Formulas" in "Physics," you might suggest the "Feynman Technique" and use a physics formula as the example.
4.  **Explain the Rationale:** In a separate field, briefly explain the science or logic behind why your tip works. For example, "This works because it leverages active recall and spaced repetition, which are proven to strengthen neural pathways for memory."

Return the entire response in the specified JSON format.
`,
});

// 3. Define the main flow
const generateSmartTipFlow = ai.defineFlow(
  {
    name: 'generateSmartTipFlow',
    inputSchema: GenerateSmartTipInputSchema,
    outputSchema: GenerateSmartTipOutputSchema,
  },
  async (input) => {
    const { output } = await generateTipPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a smart tip. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateSmartTip(input: GenerateSmartTipInput): Promise<GenerateSmartTipOutput> {
  return generateSmartTipFlow(input);
}
