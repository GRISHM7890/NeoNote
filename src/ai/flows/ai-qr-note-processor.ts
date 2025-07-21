
'use server';
/**
 * @fileOverview AI flow to process text into a "QR Note".
 *
 * This flow takes a block of text and generates a title, a concise summary,
 * and key takeaways, which can then be linked to by a QR code.
 *
 * - processQrNote - The main function to orchestrate the note generation.
 * - ProcessQrNoteInput - The input type for the flow.
 * - ProcessQrNoteOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type ProcessQrNoteInput = z.infer<typeof ProcessQrNoteInputSchema>;
const ProcessQrNoteInputSchema = z.object({
  text: z.string().describe("The source text to be processed into a shareable note."),
});

export type ProcessQrNoteOutput = z.infer<typeof ProcessQrNoteOutputSchema>;
const ProcessQrNoteOutputSchema = z.object({
  title: z.string().describe('A concise, relevant title for the note (max 5 words).'),
  summary: z.string().describe('A brief summary of the text (2-3 sentences).'),
  keyTakeaways: z.array(z.string()).describe('A list of 3-5 of the most important keywords or short phrases from the text.'),
});


// 2. Define the AI prompt
const processQrNotePrompt = ai.definePrompt({
  name: 'processQrNotePrompt',
  input: { schema: ProcessQrNoteInputSchema },
  output: { schema: ProcessQrNoteOutputSchema },
  prompt: `You are an AI assistant that specializes in condensing information into "smart notes". Your task is to process the following text and extract the most critical information.

**Source Text:**
---
{{{text}}}
---

**Your Task (Follow these steps precisely):**

1.  **Generate a Title:** Create a very short, descriptive title for these notes. It should be no more than 5 words.
2.  **Write a Summary:** Write a concise summary of the text, about 2-3 sentences long. This should capture the main idea.
3.  **Extract Key Takeaways:** Identify and list the 3 to 5 most important keywords or key phrases. These should be very short and serve as memory triggers.

Return the entire analysis in the specified JSON format.
`,
});

// 3. Define the main flow
const processQrNoteFlow = ai.defineFlow(
  {
    name: 'processQrNoteFlow',
    inputSchema: ProcessQrNoteInputSchema,
    outputSchema: ProcessQrNoteOutputSchema,
  },
  async (input) => {
    const { output } = await processQrNotePrompt(input);
    if (!output) {
      throw new Error('The AI failed to process your note. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function processQrNote(input: ProcessQrNoteInput): Promise<ProcessQrNoteOutput> {
  return processQrNoteFlow(input);
}
