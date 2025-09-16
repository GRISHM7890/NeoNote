
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

const QuestionTypesSchema = z.enum(['mcq', 'short', 'long', 'fill_in_the_blanks', 'true_or_false']);

export type GenerateQuestionsInput = z.infer<typeof GenerateQuestionsInputSchema>;
const GenerateQuestionsInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate questions (e.g., "Biology").'),
  topic: z.string().describe('The specific topic within the subject (e.g., "Photosynthesis").'),
  counts: z.object({
    mcq: z.number().int().optional().describe('Number of Multiple Choice Questions to generate.'),
    short: z.number().int().optional().describe('Number of Short Answer Questions to generate.'),
    long: z.number().int().optional().describe('Number of Long Answer Questions to generate.'),
    fill_in_the_blanks: z.number().int().optional().describe('Number of Fill in the Blanks Questions to generate.'),
    true_or_false: z.number().int().optional().describe('Number of True/False Questions to generate.'),
  }).describe('The number of questions to generate for each selected type.'),
});


const MultipleChoiceQuestionSchema = z.object({
    question: z.string().describe("The multiple choice question."),
    options: z.array(z.string()).length(4).describe("An array of 4 plausible options."),
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

const FillInTheBlanksQuestionSchema = z.object({
    question: z.string().describe("A sentence with a '___' placeholder for the blank."),
    answer: z.string().describe("The word or phrase that correctly fills the blank."),
});

const TrueOrFalseQuestionSchema = z.object({
    statement: z.string().describe("A statement that is either true or false."),
    isTrue: z.boolean().describe("Whether the statement is true or false."),
    explanation: z.string().optional().describe("A brief explanation for why the statement is true or false."),
});

export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;
const GenerateQuestionsOutputSchema = z.object({
  multipleChoiceQuestions: z.array(MultipleChoiceQuestionSchema).optional().describe('An array of generated multiple choice questions.'),
  shortAnswerQuestions: z.array(ShortAnswerQuestionSchema).optional().describe('An array of generated short answer questions.'),
  longAnswerQuestions: z.array(LongAnswerQuestionSchema).optional().describe('An array of generated long answer questions.'),
  fillInTheBlanksQuestions: z.array(FillInTheBlanksQuestionSchema).optional().describe('An array of generated fill-in-the-blanks questions.'),
  trueOrFalseQuestions: z.array(TrueOrFalseQuestionSchema).optional().describe('An array of generated true/false questions.'),
});

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  return generateQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuestionsPrompt',
  input: { schema: GenerateQuestionsInputSchema },
  output: { schema: GenerateQuestionsOutputSchema },
  prompt: `You are an expert educator and exam creator. Your task is to create a high-quality, practical question bank based on the user's specifications. The questions should be useful for students of any age group, from Class 1 upwards.

**Subject:** {{subject}}
**Topic:** {{topic}}

**CRITICAL INSTRUCTIONS:**
1.  You **MUST** generate questions for **ALL** types where a count greater than 0 is specified. There are no exceptions.
2.  Generate **EXACTLY** the specified number of questions for EACH type. Do not generate more or less.
{{#if counts.mcq}}
-   Generate **{{counts.mcq}}** Multiple Choice Questions. For each: Provide exactly four plausible options and clearly identify the correct one.
{{/if}}
{{#if counts.short}}
-   Generate **{{counts.short}}** Short Answer Questions. For each: The answer should be concise and direct (typically 1-3 sentences).
{{/if}}
{{#if counts.long}}
-   Generate **{{counts.long}}** Long Answer Questions. For each: The answer must be comprehensive, detailed, and well-structured, suitable for an exam.
{{/if}}
{{#if counts.fill_in_the_blanks}}
-   Generate **{{counts.fill_in_the_blanks}}** Fill in the Blanks Questions. For each: The question must contain a '___' placeholder. Provide the single correct answer.
{{/if}}
{{#if counts.true_or_false}}
-   Generate **{{counts.true_or_false}}** True/False Questions. For each: Provide a statement, indicate if it's true or false, and give a brief explanation.
{{/if}}
3.  The questions must be highly relevant to the provided subject and topic, and be practical for real exam preparation.
4.  The difficulty level should be appropriate for the topic.
5.  Return the result in the specified JSON format. If a question type was not requested (count is 0 or not provided), do not include its key in the final JSON output.
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
    if (!output) {
      throw new Error('The AI failed to generate questions. Please check your inputs and try again.');
    }
    return output;
  }
);
