'use server';
/**
 * @fileOverview AI-powered reference book analysis and question generation flow.
 *
 * - analyzeReferenceBook - Analyzes a book and generates study questions for key topics.
 * - ReferenceBookInput - The input type for the analyzeReferenceBook function.
 * - ReferenceBookOutput - The return type for the analyzeReferenceBook function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Schemas for generated questions
const MultipleChoiceQuestionSchema = z.object({
  question: z.string().describe("The multiple choice question."),
  options: z.array(z.string()).length(4).describe("An array of 4 plausible options."),
  correctAnswer: z.string().describe("The correct answer from the options."),
});

const ShortAnswerQuestionSchema = z.object({
  question: z.string().describe("The short answer question (should require a 1-3 sentence answer)."),
  answer: z.string().describe("A concise, correct answer to the question."),
});

const TopicQuestionsSchema = z.object({
    topicName: z.string().describe('A key topic or chapter from the book.'),
    description: z.string().describe('A brief, one-sentence description of the topic.'),
    multipleChoiceQuestions: z.array(MultipleChoiceQuestionSchema).describe("A list of 2-3 multiple choice questions for the topic."),
    shortAnswerQuestions: z.array(ShortAnswerQuestionSchema).describe("A list of 1-2 short answer questions for the topic.")
});

// Input and Output Schemas for the main flow
const ReferenceBookInputSchema = z.object({
  bookTitle: z.string().describe('The title of the reference book.'),
  author: z.string().optional().describe('The author of the book.'),
});
export type ReferenceBookInput = z.infer<typeof ReferenceBookInputSchema>;

const ReferenceBookOutputSchema = z.object({
  difficulty: z.string().describe('The estimated difficulty level (e.g., "Beginner", "Intermediate", "Advanced for NEET/JEE").'),
  topicsWithQuestions: z.array(TopicQuestionsSchema).describe('A list of key topics from the book, each with a set of generated study questions.'),
});
export type ReferenceBookOutput = z.infer<typeof ReferenceBookOutputSchema>;


// Main flow to analyze book and generate questions
const analyzeBookAndGenerateQuestionsPrompt = ai.definePrompt({
    name: 'analyzeBookAndGenerateQuestionsPrompt',
    input: { schema: ReferenceBookInputSchema },
    output: { schema: ReferenceBookOutputSchema},
    prompt: `You are an expert curriculum designer and exam creator. Your task is to analyze the provided book and generate a study guide.

    **Book Details:**
    - Book Title: {{bookTitle}}
    {{#if author}}- Author: {{author}}{{/if}}
    
    **Instructions:**
    1.  **Assess Difficulty:** First, assess the overall difficulty and intended audience of the book (e.g., "Beginner", "Intermediate", "Advanced for NEET/JEE").
    2.  **Identify Key Topics:** Identify 3 to 5 of the most important, fundamental topics covered in this book. For each topic, provide a short, one-sentence description.
    3.  **Generate Questions per Topic:** For EACH of the identified topics, you MUST generate a small set of practice questions to help a student test their understanding. This set should include:
        -   2-3 multiple choice questions (with 4 options and a correct answer).
        -   1-2 short answer questions (with a concise answer).
    
    Return the entire analysis and question set in the specified JSON format.
    `,
});

const analyzeReferenceBookFlow = ai.defineFlow(
  {
    name: 'analyzeReferenceBookFlow',
    inputSchema: ReferenceBookInputSchema,
    outputSchema: ReferenceBookOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeBookAndGenerateQuestionsPrompt(input);
    if (!output) {
      throw new Error('Failed to analyze the book and generate questions.');
    }
    return output;
  }
);


export async function analyzeReferenceBook(input: ReferenceBookInput): Promise<ReferenceBookOutput> {
  return analyzeReferenceBookFlow(input);
}
