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
  prompt: `You are a world-class AI expert at creating comprehensive, hierarchical mindmaps from text. Your task is to transform the following unstructured text into a detailed, multi-layered mindmap that covers every single concept. The output must be a weapon of clarity for any student.

**CRITICAL INSTRUCTIONS:**
1.  **Identify the Core Concept:** Read the entire text and determine the absolute central theme. This is the **root node** of your mindmap.
2.  **Extract Main Branches (Level 1):** Identify all the primary topics, major sections, or foundational pillars of the text that branch directly from the root concept. These are the direct children of the root node.
3.  **Extract Sub-Branches (Level 2):** For each main branch, you MUST break it down further. Identify all supporting details, sub-topics, definitions, key examples, or related concepts. These will be the children of the main branch nodes.
4.  **Extract Deeper Sub-Branches (Level 3+):** Do not stop at Level 2. If a sub-branch can be broken down even further (e.g., a process with multiple steps, a concept with different types), you must create another level of children. Be exhaustive. The goal is to create a deeply nested, rich, and prosperous structure.
5.  **Be Concise and Hierarchical:** Node titles should be short and to the point. The final structure MUST be a perfect tree with a single root.

**Source Text:**
---
{{{text}}}
---

Return the result as a single JSON object, starting with the root node. Do not produce anything else. The mindmap must be as detailed and structured as the "Chemical Bonding" example from NotebookLM. Forge this knowledge into a weapon.
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
