
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

export type MindmapNode = {
  title: string;
  children?: MindmapNode[];
};

const MindmapNodeSchema: z.ZodType<MindmapNode> = z.lazy(() =>
  z.object({
    title: z.string(),
    children: z.array(MindmapNodeSchema).optional(),
  })
);

const GenerateMindmapOutputSchema = z.object({
  root: MindmapNodeSchema
});
export type GenerateMindmapOutput = z.infer<typeof GenerateMindmapOutputSchema>;

export type GenerateMindmapInput = {
  text: string;
};

export async function generateMindmap(input: GenerateMindmapInput): Promise<GenerateMindmapOutput> {
  const prompt = `
Convert this text into a hierarchical mindmap:
---
${input.text}
---
`;

  return runStructuredPrompt(prompt, GenerateMindmapOutputSchema);
}
