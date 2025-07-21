
'use server';
/**
 * @fileOverview AI flow to recommend study music based on user preferences.
 *
 * This flow acts as an expert Study DJ, generating personalized music suggestions
 * to enhance focus and match the user's desired mood and study topic.
 *
 * - recommendMusic - The main function to orchestrate the music recommendation.
 * - RecommendMusicInput - The input type for the flow.
 * - RecommendMusicOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

export type RecommendMusicInput = z.infer<typeof RecommendMusicInputSchema>;
const RecommendMusicInputSchema = z.object({
  topic: z.string().describe("The subject or topic the user is studying (e.g., 'Quantum Physics', 'World War 2')."),
  mood: z.string().describe("The desired mood for the study session (e.g., 'Calm', 'Focused', 'Energetic')."),
  genre: z.string().describe("The user's preferred music genre (e.g., 'Lofi', 'Classical', 'Ambient')."),
});

const MusicSuggestionSchema = z.object({
    title: z.string().describe("The title of the suggested playlist, track, or search query."),
    description: z.string().describe("A brief, one-sentence explanation of why this music is a good fit for the user's request."),
    youtubeSearchQuery: z.string().describe("A precise, effective search query string for YouTube."),
});

export type RecommendMusicOutput = z.infer<typeof RecommendMusicOutputSchema>;
const RecommendMusicOutputSchema = z.object({
  recommendations: z.array(MusicSuggestionSchema).describe('A list of 3-5 personalized music recommendations.'),
});


// 2. Define the AI prompt for music recommendation
const recommendMusicPrompt = ai.definePrompt({
  name: 'recommendMusicPrompt',
  input: { schema: RecommendMusicInputSchema },
  output: { schema: RecommendMusicOutputSchema },
  prompt: `You are a world-class AI Study DJ. Your expertise lies in curating the perfect musical ambiance for intense and effective study sessions. You understand how different sounds affect focus, mood, and comprehension for various subjects.

**User's Study Session Details:**
- **Topic:** {{{topic}}}
- **Desired Mood:** {{{mood}}}
- **Preferred Genre:** {{{genre}}}

**Your Task:**
1.  **Analyze the Request:** Consider the combination of the topic, mood, and genre. A "Calm" mood for "Quantum Physics" requires a different kind of "Lofi" than a "Creative" mood for "Art History".
2.  **Generate Recommendations:** Create a list of 3 to 5 highly relevant music recommendations.
3.  **For Each Recommendation:**
    -   **Title:** Give the recommendation a clear title. This could be a type of playlist (e.g., "Cosmic Lofi Beats for Physics"), a specific artist, or a style of music.
    -   **Description:** Write a compelling, one-sentence reason why this choice is excellent for the user's specific needs. For example, "The steady, non-distracting beat helps maintain focus during complex problem-solving."
    -   **YouTube Search Query:** Provide the *exact* search query that will yield the best results on YouTube. Examples: "lofi hip hop radio - beats to relax/study to", "432hz focus music for studying", "dark academia classical playlist".

Return the entire analysis in the specified JSON format.
`,
});

// 3. Define the main flow
const recommendMusicFlow = ai.defineFlow(
  {
    name: 'recommendMusicFlow',
    inputSchema: RecommendMusicInputSchema,
    outputSchema: RecommendMusicOutputSchema,
  },
  async (input) => {
    const { output } = await recommendMusicPrompt(input);
    if (!output) {
      throw new Error('The AI failed to recommend music. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function recommendMusic(input: RecommendMusicInput): Promise<RecommendMusicOutput> {
  return recommendMusicFlow(input);
}
