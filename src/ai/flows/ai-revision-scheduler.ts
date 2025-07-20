
'use server';
/**
 * @fileOverview AI-powered flow for creating a spaced repetition revision schedule.
 *
 * - generateRevisionSchedule - Creates a revision plan based on a list of topics.
 * - GenerateRevisionScheduleInput - The input type for the flow.
 * - GenerateRevisionScheduleOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateRevisionScheduleInputSchema = z.object({
  topics: z.array(z.string()).min(1).describe('A list of topics the user has studied today.'),
  totalDays: z.number().int().min(7).max(90).describe('The total duration of the revision plan in days.'),
});
export type GenerateRevisionScheduleInput = z.infer<typeof GenerateRevisionScheduleInputSchema>;

const RevisionSessionSchema = z.object({
  day: z.number().int().describe('The specific day number (e.g., 2, 4, 8, 16) on which to revise the topic.'),
  topic: z.string().describe('The topic to be revised.'),
});

const GenerateRevisionScheduleOutputSchema = z.object({
  schedule: z.array(RevisionSessionSchema).describe('A list of all scheduled revision sessions.'),
});
export type GenerateRevisionScheduleOutput = z.infer<typeof GenerateRevisionScheduleOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateRevisionSchedulePrompt',
  input: { schema: GenerateRevisionScheduleInputSchema },
  output: { schema: GenerateRevisionScheduleOutputSchema },
  prompt: `You are an expert AI learning coach specializing in the Ebbinghaus forgetting curve and spaced repetition techniques. Your task is to create an optimal revision schedule for a student based on the topics they studied today.

**Student's Topics:**
{{#each topics}}
- {{{this}}}
{{/each}}

**Instructions:**
1.  For **EACH** topic provided, you must create a revision schedule based on the principles of spaced repetition.
2.  The standard spaced repetition intervals are: Day 2, Day 4, Day 8, Day 16, Day 32, and Day 64.
3.  You must generate a 'RevisionSession' object for each topic at each of these intervals, as long as the day falls within the student's total plan duration of {{totalDays}} days. For example, if totalDays is 30, you should not schedule a revision for Day 32 or Day 64.
4.  The 'day' property in the output should be the absolute day number from the start of the plan (e.g., 2, 4, 8...).
5.  Compile all generated sessions for all topics into a single 'schedule' array.

**Example:**
If the user provides "Topic A" and "Topic B", and the plan is for 30 days, you would generate sessions for both topics on days 2, 4, 8, and 16. The final schedule array would contain 8 objects (4 for Topic A, 4 for Topic B).

Return the full list of revision sessions in the specified JSON format.
`,
});

const generateRevisionScheduleFlow = ai.defineFlow(
  {
    name: 'generateRevisionScheduleFlow',
    inputSchema: GenerateRevisionScheduleInputSchema,
    outputSchema: GenerateRevisionScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to generate a revision schedule. Please try again.');
    }
    return output;
  }
);

export async function generateRevisionSchedule(input: GenerateRevisionScheduleInput): Promise<GenerateRevisionScheduleOutput> {
  return generateRevisionScheduleFlow(input);
}
