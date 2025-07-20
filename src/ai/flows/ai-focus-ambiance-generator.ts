
'use server';
/**
 * @fileOverview AI flow to generate a personalized focus session ambiance.
 *
 * This flow takes a user's study topic and desired mood and generates
 * a set of assets to create an immersive focus environment.
 *
 * - generateFocusAmbiance - The main function to orchestrate the generation.
 * - GenerateFocusAmbianceInput - The input type for the flow.
 * - GenerateFocusAmbianceOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type GenerateFocusAmbianceInput = z.infer<typeof GenerateFocusAmbianceInputSchema>;
const GenerateFocusAmbianceInputSchema = z.object({
  topic: z.string().describe('The topic the user is studying.'),
  mood: z.string().describe('The desired mood for the study session (e.g., Calm, Energetic, Mysterious).'),
  durationMinutes: z.number().int().describe('The planned duration of the focus session in minutes.'),
});


export type GenerateFocusAmbianceOutput = z.infer<typeof GenerateFocusAmbianceOutputSchema>;
const GenerateFocusAmbianceOutputSchema = z.object({
  imagePrompt: z.string().describe('A descriptive prompt for DALL-E or a similar image generator to create a beautiful, immersive background. The prompt should be atmospheric and reflect the topic and mood. e.g., "A magical, glowing forest library at night, digital art".'),
  musicKeywords: z.array(z.string()).describe('An array of 2-3 keywords for a YouTube or Spotify search to find suitable instrumental background music (e.g., "lo-fi beats", "ambient space music").'),
  affirmations: z.array(z.string()).describe('A list of 5-7 short, encouraging affirmations or quotes related to studying, learning, and the specific topic.'),
});

// 2. Define the AI prompt for ambiance generation
const generateAmbiancePrompt = ai.definePrompt({
  name: 'generateFocusAmbiancePrompt',
  input: { schema: GenerateFocusAmbianceInputSchema },
  output: { schema: GenerateFocusAmbianceOutputSchema },
  prompt: `You are an expert AI ambiance designer for study sessions. Your task is to create a set of assets for a "Focus Zone" based on the user's input.

**User's Request:**
- **Topic:** {{{topic}}}
- **Mood:** {{{mood}}}
- **Duration:** {{{durationMinutes}}} minutes

**Your Task - Generate the following:**
1.  **Image Prompt:** Create a highly descriptive, artistic prompt for an AI image generator (like DALL-E or Midjourney). The prompt should evoke the requested **mood** and subtly relate to the **topic**. The style should be beautiful and suitable for a desktop wallpaper.
    -   *Example for "Photosynthesis" & "Calm": "A serene, sun-dappled forest floor with glowing chloroplasts visible inside translucent leaves, digital painting, tranquil."*
2.  **Music Keywords:** Provide an array of 2-3 specific, searchable keywords for finding instrumental background music on platforms like YouTube or Spotify. The music should match the **mood**.
    -   *Example for "Calm": ["lo-fi hip hop radio", "calm piano music", "ambient study music"]*
3.  **Affirmations:** Generate a list of 5-7 short, powerful, and encouraging affirmations. They should be related to learning, focus, and the user's specific **topic**.
    -   *Example for "Quantum Physics": ["Each concept I learn is a new particle of understanding.", "I am capable of grasping complex ideas.", "My focus is as precise as a quantum measurement."]*

Return the result in the specified JSON format.
`,
});

// 3. Define the main flow
const generateFocusAmbianceFlow = ai.defineFlow(
  {
    name: 'generateFocusAmbianceFlow',
    inputSchema: GenerateFocusAmbianceInputSchema,
    outputSchema: GenerateFocusAmbianceOutputSchema,
  },
  async (input) => {
    const { output } = await generateAmbiancePrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a focus ambiance. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateFocusAmbiance(input: GenerateFocusAmbianceInput): Promise<GenerateFocusAmbianceOutput> {
  return generateFocusAmbianceFlow(input);
}
