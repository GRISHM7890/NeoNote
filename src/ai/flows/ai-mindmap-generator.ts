
'use server';
/**
 * @fileOverview AI-powered mindmap generation flow.
 *
 * - generateMindmap - A function that generates a mindmap from unstructured text.
 * - GenerateMindmapInput - The input type for the generateMindmap function.
 * - GenerateMindmapOutput - The return type for the generateMindmap function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const GenerateMindmapInputSchema = z.object({
  text: z.string().describe('The unstructured text to be converted into a mindmap.'),
});
export type GenerateMindmapInput = z.infer<typeof GenerateMindmapInputSchema>;


// Define a recursive schema for the mindmap nodes
const MindmapNodeSchema: z.ZodType<MindmapNode> = z.lazy(() =>
  z.object({
    title: z.string().describe('The title of this mindmap node.'),
    children: z.array(MindmapNodeSchema).optional().describe('An array of child nodes.'),
  })
);

export type MindmapNode = {
  title: string;
  children?: MindmapNode[];
};

const GenerateMindmapOutputSchema = z.object({
    root: MindmapNodeSchema.describe('The root node of the generated mindmap.')
});
export type GenerateMindmapOutput = z.infer<typeof GenerateMindmapOutputSchema>;


// 2. Define the AI prompt for mindmap generation
const prompt = ai.definePrompt({
  name: 'generateMindmapPrompt',
  input: { schema: GenerateMindmapInputSchema },
  output: { schema: GenerateMindmapOutputSchema },
  prompt: `You are an expert at creating visual aids and structured summaries. Your task is to convert the following text into a hierarchical mindmap structure.

**Instructions:**
1.  **Identify the Core Concept:** Read the text and determine the central theme or main topic. This will be the root node of the mindmap.
2.  **Extract Main Branches:** Identify the key ideas or main sections that branch off from the core concept. These will be the direct children of the root node.
3.  **Add Sub-branches:** For each main branch, identify supporting details, examples, or sub-topics. These will be the children of the main branch nodes.
4.  **Keep it Hierarchical:** The structure should be a tree, with a single root, and branches that go deeper into the details.
5.  **Be Concise:** Node titles should be short and to the point.

**Source Text:**
---
{{{text}}}
---

Return the result in the specified JSON format, starting with the root node.
`,
});

// 3. Define the main flow
const generateMindmapFlow = ai.defineFlow(
  {
    name: 'generateMindmapFlow',
    inputSchema: GenerateMindmapInputSchema,
    outputSchema: GenerateMindmapOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a mindmap. Please try again with different text.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateMindmap(input: GenerateMindmapInput): Promise<GenerateMindmapOutput> {
  return generateMindmapFlow(input);
}
