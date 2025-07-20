
'use server';
/**
 * @fileOverview AI flow to simulate a student's rank based on mock test scores.
 *
 * - simulateRank - The main function to orchestrate the rank simulation.
 * - SimulateRankInput - The input type for the flow.
 * - SimulateRankOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const SimulateRankInputSchema = z.object({
  subject: z.string().describe('The subject of the mock test.'),
  scorePercentage: z.number().min(0).max(100).describe('The percentage score achieved in the test.'),
  examType: z.string().describe('The type of exam this mock test is for (e.g., "Board Exams", "NEET", "JEE Main").'),
});
export type SimulateRankInput = z.infer<typeof SimulateRankInputSchema>;


const SimulateRankOutputSchema = z.object({
  predictedPercentile: z.number().min(0).max(100).describe('The estimated percentile based on the score.'),
  predictedRankRange: z.string().describe('The estimated rank range, e.g., "Top 10-15%", "Top 5000-7000".'),
  analysis: z.string().describe('Personalized feedback and analysis of the performance, including areas for improvement.'),
});
export type SimulateRankOutput = z.infer<typeof SimulateRankOutputSchema>;

// 2. Define the AI prompt for analysis
const prompt = ai.definePrompt({
  name: 'simulateRankPrompt',
  input: { schema: SimulateRankInputSchema },
  output: { schema: SimulateRankOutputSchema },
  prompt: `You are an expert career counselor and competitive exam analyst for Indian students. Your task is to analyze a student's mock test score and provide a realistic, yet encouraging, rank and performance analysis.

**Student's Test Data:**
- **Exam Type:** {{{examType}}}
- **Subject:** {{{subject}}}
- **Score:** {{{scorePercentage}}}%

**Instructions:**
1.  **Estimate Percentile:** Based on the exam type and score, estimate a likely percentile. For a generic 'Board Exam', assume a competitive state or national board. For exams like NEET or JEE, use your knowledge of their typical scoring distributions.
2.  **Predict Rank Range:** Convert the percentile into a practical rank range. For board exams, use percentage brackets (e.g., "Top 10-15%"). For competitive exams, provide a numerical rank range (e.g., "Rank 15000-20000").
3.  **Write Analysis:** Provide a short, constructive analysis (2-3 sentences).
    - Start by acknowledging their effort.
    - If the score is high, praise them and suggest focusing on consistency.
    - If the score is average or low, highlight that this is a good starting point and mention 1-2 generic but important areas for improvement in that subject (e.g., for Physics, "focus on conceptual clarity and numerical practice"; for History, "focus on timeline revision and connecting events").
    - Maintain a motivational and supportive tone.

Return the result in the specified JSON format.
`,
});

// 3. Define the main flow
const simulateRankFlow = ai.defineFlow(
  {
    name: 'simulateRankFlow',
    inputSchema: SimulateRankInputSchema,
    outputSchema: SimulateRankOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a rank analysis. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function simulateRank(input: SimulateRankInput): Promise<SimulateRankOutput> {
  return simulateRankFlow(input);
}
