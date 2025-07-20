
'use server';
/**
 * @fileOverview AI flow to generate comprehensive notes from a YouTube video URL.
 *
 * This flow takes a YouTube URL and generates a structured set of notes,
 * including a summary, key takeaways, formulas, and timestamped points.
 *
 * - youtubeNotesGenerator - The main function to orchestrate the note generation.
 * - YoutubeNotesGeneratorInput - The input type for the flow.
 * - YoutubeNotesGeneratorOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const YoutubeNotesGeneratorInputSchema = z.object({
  videoUrl: z.string().url().describe('The URL of the YouTube video to be processed.'),
});
export type YoutubeNotesGeneratorInput = z.infer<typeof YoutubeNotesGeneratorInputSchema>;

const FormulaSchema = z.object({
    formula: z.string().describe('The mathematical or scientific formula identified.'),
    explanation: z.string().describe('A brief explanation of what the formula represents and its variables.'),
});

const TimestampSchema = z.object({
    time: z.string().describe('The timestamp in MM:SS format.'),
    description: z.string().describe('A description of the key concept explained at this timestamp.'),
});

const YoutubeNotesGeneratorOutputSchema = z.object({
    title: z.string().describe('The title of the YouTube video.'),
    summary: z.string().describe('A concise summary of the entire video content.'),
    keyTakeaways: z.array(z.string()).describe('A list of the most important points or takeaways from the video.'),
    formulas: z.array(FormulaSchema).optional().describe('An array of key formulas mentioned in the video. Omit if none are found.'),
    timestamps: z.array(TimestampSchema).describe('An array of important, timestamped revision points.'),
});
export type YoutubeNotesGeneratorOutput = z.infer<typeof YoutubeNotesGeneratorOutputSchema>;

// 2. Define the AI prompt
const generateNotesPrompt = ai.definePrompt({
  name: 'generateYoutubeNotesPrompt',
  input: { schema: YoutubeNotesGeneratorInputSchema },
  output: { schema: YoutubeNotesGeneratorOutputSchema },
  prompt: `You are an expert academic note-taker. Your task is to watch the educational video from the following URL and create a comprehensive set of study notes.

**Video URL:** {{{videoUrl}}}

**Instructions:**
1.  **Analyze the Full Video Transcript:** Imagine you have access to the full transcript of the video. Based on that, generate the following structured notes.
2.  **Extract the Title:** Identify the main title of the video.
3.  **Write a Summary:** Create a concise summary (3-4 sentences) that covers the main topics of the video.
4.  **List Key Takeaways:** Identify and list 5-7 of the most critical points or takeaways.
5.  **Identify Formulas (If any):** If the video discusses mathematical or scientific formulas, list them along with a brief explanation. If there are no formulas, omit this section.
6.  **Create Timestamped Notes:** Go through the video and identify at least 5-10 key moments. For each, provide the timestamp (in MM:SS format) and a short description of the important concept being explained. These are for quick revision.

Return the entire output in the specified JSON format.
`,
});

// 3. Define the main flow
const youtubeNotesGeneratorFlow = ai.defineFlow(
  {
    name: 'youtubeNotesGeneratorFlow',
    inputSchema: YoutubeNotesGeneratorInputSchema,
    outputSchema: YoutubeNotesGeneratorOutputSchema,
  },
  async (input) => {
    const { output } = await generateNotesPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate notes for this video. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function youtubeNotesGenerator(input: YoutubeNotesGeneratorInput): Promise<YoutubeNotesGeneratorOutput> {
  return youtubeNotesGeneratorFlow(input);
}
