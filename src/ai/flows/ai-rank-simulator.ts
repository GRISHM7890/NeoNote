
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
  examType: z.enum(['Board Exams', 'NEET', 'JEE Main', 'JEE Advanced']).describe('The type of exam this mock test is for.'),
});
export type SimulateRankInput = z.infer<typeof SimulateRankInputSchema>;


const SimulateRankOutputSchema = z.object({
  predictedPercentile: z.number().min(0).max(100).describe('The estimated percentile based on the score, exam type, and historical data.'),
  predictedRankRange: z.string().describe('The estimated rank range, e.g., "Top 10-15%", "Rank 15000-20000". This should be specific to the exam type.'),
  analysis: z.string().describe('A personalized and detailed analysis of the performance. It should provide specific, actionable advice for the given subject and exam type. For example, for a low score in JEE Physics, it should suggest specific topics to focus on.'),
});
export type SimulateRankOutput = z.infer<typeof SimulateRankOutputSchema>;

// 2. Define the AI prompt for analysis
const prompt = ai.definePrompt({
  name: 'simulateRankPrompt',
  input: { schema: SimulateRankInputSchema },
  output: { schema: SimulateRankOutputSchema },
  prompt: `You are an expert career counselor and competitive exam analyst for Indian students. Your task is to analyze a student's mock test score and provide a realistic, yet encouraging, rank and performance analysis. You must use your knowledge of the specific difficulty and scoring distributions for each exam type.

**Student's Test Data:**
- **Exam Type:** {{{examType}}}
- **Subject:** {{{subject}}}
- **Score:** {{{scorePercentage}}}%

**Instructions:**
1.  **Estimate Percentile:** Based on the **examType** and score, estimate a realistic percentile. A 70% in 'Board Exams' is very different from a 70% in 'JEE Advanced'. Use your knowledge of these exams to provide an accurate estimate.
2.  **Predict Rank Range:** Convert the percentile into a practical rank range. For board exams, use percentage brackets (e.g., "Top 10-15%"). For competitive exams like NEET or JEE, provide a numerical rank range (e.g., "Rank 15000-20000").
3.  **Write Detailed, Actionable Analysis:** Provide a personalized analysis (2-4 sentences).
    - Acknowledge their effort.
    - Based on the score, subject, and **exam type**, give specific advice.
    - **Example for low score in JEE Main Physics:** "This score is a starting point. For JEE Main Physics, a score in this range often indicates a need to strengthen foundational concepts in Mechanics and Electromagnetism. Focus on solving previous year questions for these two areas to see a significant improvement."
    - **Example for good score in NEET Biology:** "An excellent score! This suggests strong command over both Zoology and Botany. To maintain this, focus on regular revision of NCERT diagrams and practicing assertion-reason questions, which are common in NEET."
    - Maintain a motivational and supportive tone.

Return the result in the specified JSON format. The analysis must be specific and actionable.
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
