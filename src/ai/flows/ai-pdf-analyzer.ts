
'use server';
/**
 * @fileOverview AI flow to chat with a PDF document.
 *
 * - chatWithPdf - A function that answers a user's question based on a PDF document.
 * - ChatWithPdfInput - The input type for the flow.
 * - ChatWithPdfOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

const ChatWithPdfInputSchema = z.object({
  query: z.string().describe("The user's question about the PDF document."),
  pdfDataUri: z.string().describe(
    "The PDF document as a data URI. Expected format: 'data:application/pdf;base64,...'"
  ),
});
export type ChatWithPdfInput = z.infer<typeof ChatWithPdfInputSchema>;

const ChatWithPdfOutputSchema = z.object({
  answer: z.string().describe('The AI-generated answer based on the content of the PDF.'),
});
export type ChatWithPdfOutput = z.infer<typeof ChatWithPdfOutputSchema>;


const prompt = ai.definePrompt({
  name: 'chatWithPdfPrompt',
  input: { schema: ChatWithPdfInputSchema },
  output: { schema: ChatWithPdfOutputSchema },
  model: googleAI.model('gemini-1.5-flash'),
  system: `You are an expert academic assistant. Your task is to answer questions based on the provided PDF document. Your answers should be clear, concise, and directly supported by the text in the document.

Instructions:
1.  Carefully analyze the user's question.
2.  Thoroughly search the provided PDF document for relevant information.
3.  Formulate an answer that directly addresses the question using only the information found in the PDF.
4.  If the answer cannot be found in the document, state that clearly.
`,
  prompt: `Document: {{media url=pdfDataUri}}
  
Question: {{{query}}}
`,
});

const chatWithPdfFlow = ai.defineFlow(
  {
    name: 'chatWithPdfFlow',
    inputSchema: ChatWithPdfInputSchema,
    outputSchema: ChatWithPdfOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a response. Please try again.');
    }
    return output;
  }
);

export async function chatWithPdf(input: ChatWithPdfInput): Promise<ChatWithPdfOutput> {
  return chatWithPdfFlow(input);
}
