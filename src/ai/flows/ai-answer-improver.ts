
'use server';
/**
 * @fileOverview AI flow to provide detailed, expert feedback on a student's written answer.
 *
 * This flow acts as an AI examiner, taking into account the question, subject, exam level,
 * and marks to provide a comprehensive analysis.
 *
 * - improveAnswer - The main function to orchestrate the feedback generation.
 * - ImproveAnswerInput - The input type for the flow.
 * - ImproveAnswerOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const ImproveAnswerInputSchema = z.object({
  question: z.string().describe("The original question the user was trying to answer."),
  userAnswer: z.string().describe("The user's written answer."),
  subject: z.string().describe("The academic subject (e.g., 'Physics', 'History')."),
  examLevel: z.string().describe("The level of the exam (e.g., 'Board Exam (Class 12)', 'NEET')."),
  totalMarks: z.number().int().describe("The total marks allotted for this question."),
});
export type ImproveAnswerInput = z.infer<typeof ImproveAnswerInputSchema>;


const ImproveAnswerOutputSchema = z.object({
  predictedScore: z.number().describe("The score the AI predicts the user's answer would receive."),
  strengths: z.array(z.string()).describe("A list of what the user did well in their answer."),
  areasForImprovement: z.array(z.string()).describe("A list of specific areas where the user's answer can be improved."),
  detailedFeedback: z.string().describe("A comprehensive paragraph explaining the rationale behind the score and suggestions."),
  modelAnswer: z.string().describe("A perfect, top-scoring 'god-tier' model answer for the question, formatted with markdown for clarity."),
});
export type ImproveAnswerOutput = z.infer<typeof ImproveAnswerOutputSchema>;


// 2. Define the AI prompt for answer analysis
const improveAnswerPrompt = ai.definePrompt({
  name: 'improveAnswerPrompt',
  input: { schema: ImproveAnswerInputSchema },
  output: { schema: ImproveAnswerOutputSchema },
  prompt: `You are a Master Examiner AI for the Indian education system, known for your ability to provide 'god-tier' feedback that helps students maximize their marks. Your analysis must be strict, precise, and incredibly insightful.

**You are grading the following:**
- **Subject:** {{{subject}}}
- **Exam Level:** {{{examLevel}}}
- **Question:** {{{question}}}
- **Marks Allotted:** {{{totalMarks}}}

**Student's Submitted Answer:**
---
{{{userAnswer}}}
---

**Your Task (Follow these steps precisely):**

1.  **Analyze the Student's Answer:**
    -   Evaluate the answer for accuracy, completeness, inclusion of keywords, structure, and presentation based on the **Exam Level** and **Marks Allotted**.
    -   Identify both the strong points and the deficiencies.

2.  **Predict a Score:**
    -   Based on your strict evaluation, assign a realistic score out of the total marks. This is the **predictedScore**.

3.  **Identify Strengths:**
    -   List 2-3 specific, positive points about the user's answer in the **strengths** array. Be encouraging but factual (e.g., "Correctly defined the main term," "Good use of an example").

4.  **Identify Areas for Improvement:**
    -   List the 2-4 most critical weaknesses or missing elements in the **areasForImprovement** array. Be direct and clear (e.g., "Did not mention the second law of thermodynamics," "The diagram was not labeled correctly," "Conclusion is weak").

5.  **Write Detailed Feedback:**
    -   In the **detailedFeedback** field, write a comprehensive paragraph. Explain WHY you gave the predicted score, referencing the strengths and weaknesses. Offer concrete advice on how to improve the answer to score full marks.

6.  **Craft a God-Tier Model Answer:**
    -   In the **modelAnswer** field, write a perfect, top-scoring answer for the question.
    -   This answer must be perfectly structured, using **Markdown** for formatting (e.g., headings, bold keywords, bullet points, etc.).
    -   It should be the ideal length and depth for the allotted marks and serve as a gold standard for the student.

Return the entire analysis in the specified JSON format.
`,
});

// 3. Define the main flow
const improveAnswerFlow = ai.defineFlow(
  {
    name: 'improveAnswerFlow',
    inputSchema: ImproveAnswerInputSchema,
    outputSchema: ImproveAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await improveAnswerPrompt(input);
    if (!output) {
      throw new Error('The AI failed to provide feedback for your answer. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function improveAnswer(input: ImproveAnswerInput): Promise<ImproveAnswerOutput> {
  return improveAnswerFlow(input);
}
