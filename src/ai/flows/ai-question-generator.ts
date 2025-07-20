
'use server';
/**
 * @fileOverview AI-powered question bank generation flow.
 *
 * - generateQuestions - A function that generates questions for a given subject and topic.
 * - GenerateQuestionsInput - The input type for the generateQuestions function.
 * - GenerateQuestionsOutput - The return type for the generateQuestions function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuestionTypesSchema = z.enum(['mcq', 'short', 'long']);

export const GenerateQuestionsInputSchema = z.object({
  subject: z
    .string()
    .describe('The subject for which to generate questions (e.g., "Biology").'),
  topic: z
    .string()
    .describe('The specific topic within the subject (e.g., "Photosynthesis").'),
  questionCount: z
    .number()
    .int()
    .min(1)
    .max(50)
    .describe('The number of questions to generate for each selected type.'),
  questionTypes: z
    .array(QuestionTypesSchema)
    .min(1)
    .describe('An array of question types to generate.'),
});
export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;

const MultipleChoiceQuestionSchema = z.object({
    question: z.string().describe("The multiple choice question."),
    options: z.array(z.string()).length(4).describe("An array of 4 possible options."),
    correctAnswer: z.string().describe("The correct answer from the options."),
});

const ShortAnswerQuestionSchema = z.object({
    question: z.string().describe("The short answer question (should require a 1-3 sentence answer)."),
    answer: z.string().describe("A concise, correct answer to the question."),
});

const LongAnswerQuestionSchema = z.object({
    question: z.string().describe("The long answer question (should require a paragraph or more to answer)."),
    answer: z.string().describe("A detailed, correct answer to the question, often in bullet points or steps."),
});

export const GenerateQuestionsOutputSchema = z.object({
  multipleChoiceQuestions: z.array(MultipleChoiceQuestionSchema).optional().describe('An array of generated multiple choice questions.'),
  shortAnswerQuestions: z.array(ShortAnswerQuestionSchema).optional().describe('An array of generated short answer questions.'),
  longAnswerQuestions: z.array(LongAnswerQuestionSchema).optional().describe('An array of generated long answer questions.'),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are an expert educator and exam creator for students in India. Your task is to create a high-quality question bank based on the user's specifications.

**Subject:** {{subject}}
**Topic:** {{topic}}
**Number of Questions per Type:** {{questionCount}}
**Question Types to Generate:**
{{#each questionTypes}}
- {{this}}
{{/each}}

**Instructions:**
1.  Generate exactly {{questionCount}} questions for EACH of the types specified in "Question Types to Generate".
2.  The questions should be relevant to the provided subject and topic.
3.  For Multiple Choice Questions (MCQ), provide exactly four plausible options and identify the correct one.
4.  For Short Answer questions, the answer should be concise (1-3 sentences).
5.  For Long Answer questions, the answer should be detailed and well-structured, as if for an exam.
6.  Ensure the difficulty is appropriate for a high school or competitive exam student.
7.  Return the result in the specified JSON format. If a question type is not requested, do not include its key in the output.
`,
});

const generateQuestionsFlow = ai.defineFlow(
  {
    name: 'generateQuestionsFlow',
    inputSchema: GenerateQuestionsInputSchema,
    outputSchema: GenerateQuestionsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
