
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const MultipleChoiceQuestionSchema = z.object({
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctAnswer: z.string(),
});

const ShortAnswerQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const LongAnswerQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const FillInTheBlanksQuestionSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const TrueOrFalseQuestionSchema = z.object({
  statement: z.string(),
  isTrue: z.boolean(),
  explanation: z.string().optional(),
});

const GenerateQuestionsOutputSchema = z.object({
  multipleChoiceQuestions: z.array(MultipleChoiceQuestionSchema).optional(),
  shortAnswerQuestions: z.array(ShortAnswerQuestionSchema).optional(),
  longAnswerQuestions: z.array(LongAnswerQuestionSchema).optional(),
  fillInTheBlanksQuestions: z.array(FillInTheBlanksQuestionSchema).optional(),
  trueOrFalseQuestions: z.array(TrueOrFalseQuestionSchema).optional(),
});
export type GenerateQuestionsOutput = z.infer<typeof GenerateQuestionsOutputSchema>;

export type GenerateQuestionsInput = {
  subject: string;
  topic: string;
  className?: string;
  counts: {
    mcq?: number;
    short?: number;
    long?: number;
    fill_in_the_blanks?: number;
    true_or_false?: number;
  };
};

export async function generateQuestions(input: GenerateQuestionsInput): Promise<GenerateQuestionsOutput> {
  const prompt = `
You are an expert educator. Create a question bank:
- Subject: ${input.subject}
- Topic: ${input.topic}
${input.className ? `- Class Level: ${input.className}` : ""}

Counts requested:
${input.counts.mcq ? `- MCQs: ${input.counts.mcq}` : ""}
${input.counts.short ? `- Short Answer: ${input.counts.short}` : ""}
${input.counts.long ? `- Long Answer: ${input.counts.long}` : ""}
${input.counts.fill_in_the_blanks ? `- Fill in the Blanks: ${input.counts.fill_in_the_blanks}` : ""}
${input.counts.true_or_false ? `- True/False: ${input.counts.true_or_false}` : ""}
`;

  return runStructuredPrompt(prompt, GenerateQuestionsOutputSchema);
}
