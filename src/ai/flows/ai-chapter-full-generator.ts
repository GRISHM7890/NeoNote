
'use server';
/**
 * @fileOverview AI flow to generate a complete study package for a given chapter.
 *
 * This flow generates a summary, detailed notes, and previous year questions (PYQs)
 * based on the chapter name, class, subject, and educational board.
 *
 * - generateChapterFullPackage - The main function to orchestrate the generation.
 * - GenerateChapterFullPackageInput - The input type for the flow.
 * - GenerateChapterFullPackageOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas
const GenerateChapterFullPackageInputSchema = z.object({
  chapterName: z.string().describe("The name of the chapter."),
  className: z.string().describe("The class or grade level (e.g., 'Class 10')."),
  subject: z.string().describe("The academic subject (e.g., 'Physics', 'History')."),
  board: z.string().describe("The educational board (e.g., 'CBSE', 'ICSE', 'Maharashtra State Board')."),
});
export type GenerateChapterFullPackageInput = z.infer<typeof GenerateChapterFullPackageInputSchema>;

const PYQSchema = z.object({
    question: z.string().describe("The previous year question."),
    answer: z.string().describe("A detailed, correct answer to the question."),
});

const GenerateChapterFullPackageOutputSchema = z.object({
  summary: z.string().describe("A comprehensive yet concise summary of the entire chapter."),
  notes: z.string().describe("Detailed, high-quality, well-structured notes for the chapter, formatted using markdown for clarity (headings, bold, bullet points)."),
  pyqs: z.array(PYQSchema).describe("A list of 5-10 highly targeted Previous Year Questions (PYQs) relevant to the chapter, board, and class, complete with detailed answers."),
});
export type GenerateChapterFullPackageOutput = z.infer<typeof GenerateChapterFullPackageOutputSchema>;

// 2. Define the AI prompt
const generateChapterPackagePrompt = ai.definePrompt({
  name: 'generateChapterPackagePrompt',
  input: { schema: GenerateChapterFullPackageInputSchema },
  output: { schema: GenerateChapterFullPackageOutputSchema },
  prompt: `You are a master educator AI for the Indian education system. Your task is to generate a complete, high-quality study package for a student based on the details they provide.

**Student's Requirements:**
- **Board:** {{{board}}}
- **Class:** {{{className}}}
- **Subject:** {{{subject}}}
- **Chapter:** {{{chapterName}}}

**Your Task (Follow these steps precisely):**

1.  **Generate a Chapter Summary:**
    *   Create a comprehensive summary of the "{{{chapterName}}}" chapter. It should cover all the main concepts and be easy to understand.

2.  **Generate High-Quality Notes:**
    *   Create detailed, well-structured notes for the chapter.
    *   Use Markdown for formatting: use headings, subheadings, bold keywords, and bullet points to make the notes easy to read and revise.
    *   The notes should be thorough enough for exam preparation.

3.  **Generate Targeted Previous Year Questions (PYQs):**
    *   Based on the specified **Board**, **Class**, and **Chapter**, generate a list of 5 to 10 highly relevant Previous Year Questions (PYQs).
    *   These questions should be ones that have frequently appeared in past exams or are of high importance.
    *   For **EACH** question, you **MUST** provide a detailed, accurate answer.

Return the entire study package in the specified JSON format.
`,
});

// 3. Define the main flow
const generateChapterFullPackageFlow = ai.defineFlow(
  {
    name: 'generateChapterFullPackageFlow',
    inputSchema: GenerateChapterFullPackageInputSchema,
    outputSchema: GenerateChapterFullPackageOutputSchema,
  },
  async (input) => {
    const { output } = await generateChapterPackagePrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate the study package. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateChapterFullPackage(input: GenerateChapterFullPackageInput): Promise<GenerateChapterFullPackageOutput> {
  return generateChapterFullPackageFlow(input);
}
