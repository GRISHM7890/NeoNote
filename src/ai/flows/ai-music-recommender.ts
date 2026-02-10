
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const MusicSuggestionSchema = z.object({
  title: z.string(),
  description: z.string(),
  youtubeSearchQuery: z.string(),
});

const RecommendMusicOutputSchema = z.object({
  recommendations: z.array(MusicSuggestionSchema),
});
export type RecommendMusicOutput = z.infer<typeof RecommendMusicOutputSchema>;

export type RecommendMusicInput = {
  topic: string;
  mood: string;
  genre: string;
};

export async function recommendMusic(input: RecommendMusicInput): Promise<RecommendMusicOutput> {
  const prompt = `
Recommend study music for:
Topic: ${input.topic}
Mood: ${input.mood}
Genre: ${input.genre}
`;

  return runStructuredPrompt(prompt, RecommendMusicOutputSchema);
}
