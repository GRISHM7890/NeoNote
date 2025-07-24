
'use server';
/**
 * @fileOverview AI flow to generate a pack of custom stickers based on a topic.
 *
 * This flow takes a topic, brainstorms sticker ideas, and then uses an image
 * generation model to create a set of downloadable stickers.
 *
 * - generateStickers - The main function to orchestrate the sticker generation.
 * - GenerateStickersInput - The input type for the flow.
 * - GenerateStickersOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// 1. Define Input/Output Schemas
export type GenerateStickersInput = z.infer<typeof GenerateStickersInputSchema>;
const GenerateStickersInputSchema = z.object({
  topic: z.string().describe("The topic to generate stickers about (e.g., 'Photosynthesis', 'Ancient Rome')."),
});

export type GenerateStickersOutput = z.infer<typeof GenerateStickersOutputSchema>;
const GenerateStickersOutputSchema = z.object({
  stickerUrls: z.array(z.string().url()).describe("An array of data URI strings for the generated sticker images."),
});


// 2. Define AI flow to brainstorm sticker ideas first
const stickerIdeaPrompt = ai.definePrompt({
    name: 'stickerIdeaPrompt',
    input: { schema: GenerateStickersInputSchema },
    output: { schema: z.object({ ideas: z.array(z.string()).describe("A list of 4-6 simple, visually representable concepts for stickers related to the topic.") }) },
    prompt: `You are a creative designer brainstorming ideas for a sticker pack.
    
    Topic: {{{topic}}}

    Generate a list of 4 to 6 simple, concrete nouns or very short phrases that would make good, clear stickers related to this topic.
    For example, for 'Photosynthesis', ideas could be 'Sun', 'Chloroplast', 'Water Molecule', 'Glucose Molecule'.
    For 'Ancient Rome', ideas could be 'Colosseum', 'Roman Legionary Helmet', 'Gladius Sword', 'Laurel Wreath'.
    
    Keep the ideas simple and iconic.
    `
});


// 3. Define the main flow
export async function generateStickers(input: GenerateStickersInput): Promise<GenerateStickersOutput> {
  
  // Step 1: Brainstorm ideas
  const { output: ideaResult } = await stickerIdeaPrompt(input);
  if (!ideaResult?.ideas || ideaResult.ideas.length === 0) {
      throw new Error("Could not brainstorm any sticker ideas for this topic.");
  }
  
  // Step 2: Generate an image for each idea in parallel
  const imagePromises = ideaResult.ideas.map(idea => {
      const imagePrompt = `${idea}, flat vector icon, sticker style, white background, die-cut border`;
      return ai.generate({
          model: 'googleai/gemini-2.0-flash-preview-image-generation',
          prompt: imagePrompt,
          config: {
              responseModalities: ['TEXT', 'IMAGE'],
          },
      });
  });

  const results = await Promise.all(imagePromises);
  
  const stickerUrls = results
    .map(res => res.media?.url)
    .filter((url): url is string => !!url);

  return { stickerUrls };
}
