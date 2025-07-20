
'use server';
/**
 * @fileOverview AI-powered flow to find and explain textbook solutions.
 *
 * - findSolution - A function that provides a detailed solution and analysis for a given textbook problem.
 * - FindSolutionInput - The input type for the findSolution function.
 * - FindSolutionOutput - The return type for the findSolution function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FindSolutionInputSchema = z.object({
  board: z.string().describe('The educational board (e.g., "NCERT", "CBSE", "ICSE").'),
  className: z.string().describe('The class or grade level (e.g., "Class 10").'),
  subject: z.string().describe('The subject of the problem (e.g., "Physics").'),
  chapter: z.string().describe('The chapter the problem is from.'),
  query: z.string().describe('The specific question, either by number (e.g., "Question 5") or by pasting the question text.'),
});
export type FindSolutionInput = z.infer<typeof FindSolutionInputSchema>;

const SimilarProblemSchema = z.object({
    problem: z.string().describe("A similar practice problem."),
    answer: z.string().describe("The answer to the similar problem.")
});

const PastPaperAnalysisSchema = z.object({
    frequency: z.string().describe('How often this type of question appears (e.g., "High", "Medium", "Low").'),
    years: z.array(z.string()).describe('A list of years this type of question appeared in board exams.'),
    notes: z.string().describe("Additional notes on the importance of this question type for exams.")
});

const FindSolutionOutputSchema = z.object({
  problemStatement: z.string().describe('The identified problem statement based on the user query.'),
  stepByStepSolution: z.array(z.string()).describe('A detailed, step-by-step walkthrough of the solution. Use LaTeX for mathematical notation.'),
  finalAnswer: z.string().describe('The final, concise answer to the problem.'),
  conceptsInvolved: z.array(z.string()).describe('A list of key scientific or mathematical concepts used in the solution.'),
  similarProblems: z.array(SimilarProblemSchema).describe('A list of similar problems for practice.'),
  pastPaperAnalysis: PastPaperAnalysisSchema.describe('An analysis of the question\'s importance in past board exams.'),
});
export type FindSolutionOutput = z.infer<typeof FindSolutionOutputSchema>;

export async function findSolution(input: FindSolutionInput): Promise<FindSolutionOutput> {
  return findSolutionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findSolutionPrompt',
  input: { schema: FindSolutionInputSchema },
  output: { schema: FindSolutionOutputSchema },
  prompt: `You are an expert AI tutor for Indian students. Your task is to provide a comprehensive solution for a textbook problem, along with valuable exam-focused insights.

**Problem Details:**
- **Board:** {{board}}
- **Class:** {{className}}
- **Subject:** {{subject}}
- **Chapter:** {{chapter}}
- **Question:** {{{query}}}

**Your Task:**
1.  **Identify the Problem:** First, clearly state the problem that the user is asking about.
2.  **Provide a Step-by-Step Solution:** Give a detailed, easy-to-follow, step-by-step solution. Use LaTeX for all mathematical or chemical notation.
3.  **State the Final Answer:** Clearly provide the final, correct answer.
4.  **List Concepts Involved:** Identify and list the key scientific concepts or formulas required to solve this problem.
5.  **Generate Similar Problems:** Create 2-3 similar problems for the student to practice, along with their answers.
6.  **Analyze Past Papers:** Provide an analysis of how important this type of question is for board exams. Estimate its frequency of appearance (High, Medium, Low), list a few years it might have appeared, and add a concluding note on its importance.

Return the result in the specified JSON format. The response must be thorough and accurate.
`,
});

const findSolutionFlow = ai.defineFlow(
  {
    name: 'findSolutionFlow',
    inputSchema: FindSolutionInputSchema,
    outputSchema: FindSolutionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
