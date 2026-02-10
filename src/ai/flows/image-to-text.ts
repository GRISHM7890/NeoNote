
'use server';

import { runStructuredVisionPrompt } from '@/ai/bytez';
import { z } from 'zod';

const ImageToTextOutputSchema = z.object({
  extractedText: z.string(),
});
export type ImageToTextOutput = z.infer<typeof ImageToTextOutputSchema>;

export type ImageToTextInput = {
  photoDataUri: string;
};

export async function imageToText(input: ImageToTextInput): Promise<ImageToTextOutput> {
  const prompt = "Extract all text from this image accurately. Maintain the layout if possible.";
  return runStructuredVisionPrompt(prompt, input.photoDataUri, ImageToTextOutputSchema);
}
