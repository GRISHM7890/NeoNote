
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
export type GenerateChapterFullPackageInput = z.infer<typeof GenerateChapterFullPackageInputSchema>;
const GenerateChapterFullPackageInputSchema = z.object({
  chapterName: z.string().describe("The name of the chapter."),
  className: z.string().describe("The class or grade level (e.g., 'Class 10')."),
  subject: z.string().describe("The academic subject (e.g., 'Physics', 'History')."),
  board: z.string().describe("The educational board (e.g., 'CBSE', 'ICSE', 'Maharashtra State Board')."),
});

const PYQSchema = z.object({
    question: z.string().describe("The previous year question."),
    answer: z.string().describe("A detailed, correct answer to the question."),
});

export type GenerateChapterFullPackageOutput = z.infer<typeof GenerateChapterFullPackageOutputSchema>;
const GenerateChapterFullPackageOutputSchema = z.object({
  summary: z.string().describe("A comprehensive yet concise summary of the entire chapter."),
  notes: z.string().describe("Detailed, high-quality, well-structured notes for the chapter, formatted using markdown for clarity (headings, bold, bullet points)."),
  pyqs: z.array(PYQSchema).describe("A list of 5-10 highly targeted Previous Year Questions (PYQs) relevant to the chapter, board, and class, complete with detailed answers."),
});

// 2. Define specialized AI prompts for each part of the package

const summaryPrompt = ai.definePrompt({
  name: 'generateChapterSummaryPrompt',
  input: { schema: GenerateChapterFullPackageInputSchema },
  output: { schema: z.object({ summary: GenerateChapterFullPackageOutputSchema.shape.summary }) },
  prompt: `You are a master educator AI. Generate a deeply detailed, comprehensive summary for the following chapter. It should be long and thorough, equivalent to 2-3 pages of text, covering all main concepts, sub-topics, definitions, and key examples.

- **Board:** {{{board}}}
- **Class:** {{{className}}}
- **Subject:** {{{subject}}}
- **Chapter:** {{{chapterName}}}

Focus on creating an exhaustive summary that is easy to understand and can serve as a primary study document. Use markdown for clear formatting.`,
});

const notesPrompt = ai.definePrompt({
  name: 'generateChapterNotesPrompt',
  input: { schema: GenerateChapterFullPackageInputSchema },
  output: { schema: z.object({ notes: GenerateChapterFullPackageOutputSchema.shape.notes }) },
  prompt: `You are a master educator AI. Create detailed, well-structured, high-quality notes for the following chapter:

- **Board:** {{{board}}}
- **Class:** {{{className}}}
- **Subject:** {{{subject}}}
- **Chapter:** {{{chapterName}}}

Use Markdown for formatting: use headings, subheadings, bold keywords, bullet points, and nested lists to make the notes easy to read and revise. The notes must be thorough enough for exam preparation.`,
});

const pyqsPrompt = ai.definePrompt({
  name: 'generateChapterPyqsPrompt',
  input: { schema: GenerateChapterFullPackageInputSchema },
  output: { schema: z.object({ pyqs: GenerateChapterFullPackageOutputSchema.shape.pyqs }) },
  prompt: `You are a master exam creator AI for the Indian education system. Generate a list of 5 to 10 highly relevant Previous Year Questions (PYQs) for the following chapter:

- **Board:** {{{board}}}
- **Class:** {{{className}}}
- **Subject:** {{{subject}}}
- **Chapter:** {{{chapterName}}}

These questions should be ones that have frequently appeared in past exams or are of high importance. For EACH question, you MUST provide a detailed, accurate answer.`,
});


// 3. Define the main flow to orchestrate the parallel calls
const generateChapterFullPackageFlow = ai.defineFlow(
  {
    name: 'generateChapterFullPackageFlow',
    inputSchema: GenerateChapterFullPackageInputSchema,
    outputSchema: GenerateChapterFullPackageOutputSchema,
  },
  async (input) => {
    // Run all three generation prompts in parallel for efficiency
    const [summaryResult, notesResult, pyqsResult] = await Promise.all([
      summaryPrompt(input),
      notesPrompt(input),
      pyqsPrompt(input),
    ]);
    
    const summary = summaryResult.output?.summary;
    const notes = notesResult.output?.notes;
    const pyqs = pyqsResult.output?.pyqs;

    if (!summary || !notes || !pyqs) {
      throw new Error('The AI failed to generate one or more parts of the study package. Please try again.');
    }

    return { summary, notes, pyqs };
  }
);

// 4. Export a wrapper function for client-side use
export async function generateChapterFullPackage(input: GenerateChapterFullPackageInput): Promise<GenerateChapterFullPackageOutput> {
  return generateChapterFullPackageFlow(input);
}
