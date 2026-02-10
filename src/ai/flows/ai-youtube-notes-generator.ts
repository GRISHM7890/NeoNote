
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const FormulaSchema = z.object({
  formula: z.string(),
  explanation: z.string(),
});

const TimestampSchema = z.object({
  time: z.string(),
  description: z.string(),
});

const YoutubeNotesGeneratorOutputSchema = z.object({
  title: z.string(),
  summary: z.string(),
  keyTakeaways: z.array(z.string()),
  formulas: z.array(FormulaSchema).optional(),
  timestamps: z.array(TimestampSchema),
});
export type YoutubeNotesGeneratorOutput = z.infer<typeof YoutubeNotesGeneratorOutputSchema>;

export type YoutubeNotesGeneratorInput = {
  videoUrl: string;
};

export async function youtubeNotesGenerator(input: YoutubeNotesGeneratorInput): Promise<YoutubeNotesGeneratorOutput> {
  const prompt = `
Generate notes for this YouTube video: ${input.videoUrl}
Analyze the video content and structure it with summary, key takeaways, formulas, and 5-10 timestamps.
`;

  return runStructuredPrompt(prompt, YoutubeNotesGeneratorOutputSchema);
}
