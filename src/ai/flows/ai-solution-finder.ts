
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const SimilarProblemSchema = z.object({
  problem: z.string(),
  answer: z.string()
});

const PastPaperAnalysisSchema = z.object({
  frequency: z.string(),
  years: z.array(z.string()),
  notes: z.string()
});

const FindSolutionOutputSchema = z.object({
  problemStatement: z.string(),
  stepByStepSolution: z.array(z.string()),
  finalAnswer: z.string(),
  conceptsInvolved: z.array(z.string()),
  similarProblems: z.array(SimilarProblemSchema),
  pastPaperAnalysis: PastPaperAnalysisSchema,
});
export type FindSolutionOutput = z.infer<typeof FindSolutionOutputSchema>;

export type FindSolutionInput = {
  board: string;
  className: string;
  subject: string;
  chapter: string;
  query: string;
};

export async function findSolution(input: FindSolutionInput): Promise<FindSolutionOutput> {
  const prompt = `
Find solution for:
Board: ${input.board}
Class: ${input.className}
Subject: ${input.subject}
Chapter: ${input.chapter}
Question: ${input.query}
Use LaTeX.
`;

  return runStructuredPrompt(prompt, FindSolutionOutputSchema);
}
