'use server';

/**
 * @fileOverview Extracts text from an image of a textbook page using AI.
 *
 * - imageToText - A function that handles the image to text extraction process.
 * - ImageToTextInput - The input type for the imageToText function.
 * - ImageToTextOutput - The return type for the imageToText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImageToTextInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a textbook page, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ImageToTextInput = z.infer<typeof ImageToTextInputSchema>;

const ImageToTextOutputSchema = z.object({
  extractedText: z.string().describe('The extracted text from the image.'),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  return imageToTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'imageToTextPrompt',
  input: {schema: ImageToTextInputSchema},
  output: {schema: ImageToTextOutputSchema},
  prompt: `You are an expert OCR reader.

You will extract the text from the following image.  Return ONLY the text in the image.

Image: {{media url=photoDataUri}}`,
});

const imageToTextFlow = ai.defineFlow(
  {
    name: 'imageToTextFlow',
    inputSchema: ImageToTextInputSchema,
    outputSchema: ImageToTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
