
'use server';
/**
 * @fileOverview AI-powered study timetable generation flow.
 *
 * - generateTimetable - A function that generates a study plan based on user inputs.
 * - GenerateTimetableInput - The input type for the generateTimetable function.
 * - GenerateTimetableOutput - The return type for the generateTimetable function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export type GenerateTimetableInput = z.infer<typeof GenerateTimetableInputSchema>;
const GenerateTimetableInputSchema = z.object({
  subjects: z.array(z.string()).min(1).describe('The list of subjects the user needs to study.'),
  days: z.number().int().min(1).describe('The total number of days available for studying.'),
  hoursPerDay: z.number().min(1).max(16).describe('The number of hours the user can study each day.'),
  examName: z.string().optional().describe('The name of the exam or goal the user is preparing for.'),
});

const StudySessionSchema = z.object({
  subject: z.string().describe('The subject to be studied in this session.'),
  topic: z.string().describe('The specific topic or chapter to cover during this session.'),
});

const DailyPlanSchema = z.object({
  day: z.number().int().describe('The day number in the study plan (e.g., 1, 2, 3).'),
  sessions: z.array(StudySessionSchema).describe('An array of study sessions scheduled for this day.'),
});

export type GenerateTimetableOutput = z.infer<typeof GenerateTimetableOutputSchema>;
const GenerateTimetableOutputSchema = z.object({
  title: z.string().optional().describe('A suitable title for the generated study plan.'),
  schedule: z.array(DailyPlanSchema).describe('The day-by-day study schedule.'),
});

export async function generateTimetable(input: GenerateTimetableInput): Promise<GenerateTimetableOutput> {
  return generateTimetableFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTimetablePrompt',
  input: { schema: GenerateTimetableInputSchema },
  output: { schema: GenerateTimetableOutputSchema },
  prompt: `You are an expert academic planner and strategist. Your task is to create a realistic, balanced, and effective study timetable for a student.

**Student's Requirements:**
- **Goal:** {{#if examName}}Prepare for {{examName}}{{else}}General Studies{{/if}}
- **Subjects to Cover:** {{#each subjects}}- {{this}} {{/each}}
- **Total Duration:** {{days}} days
- **Daily Study Time:** {{hoursPerDay}} hours

**CRITICAL INSTRUCTIONS:**
1.  You **MUST** create a daily schedule that spans the **ENTIRE** duration of **{{days}}** days. Do not shorten the plan. You must provide a plan for every single day from 1 to {{days}}.
2.  **Create a Title:** Generate a fitting title for this study plan.
3.  **Break Down Subjects:** Logically break down the subjects into smaller, manageable topics or chapters that can be covered in daily study sessions.
4.  **Allocate Sessions:** For each day, plan out study sessions. The number of sessions should be reasonable for the {{hoursPerDay}} hours of study. A typical session is 1.5 to 2 hours.
5.  **Balance Subjects:** Ensure a good mix of subjects each day or each week to keep the student engaged and prevent burnout. Alternate between difficult and easier subjects if possible.
6.  **Include Revision:** Strategically schedule revision days or sessions for topics already covered. For longer plans (over 7 days), dedicate at least one day a week for revision and buffer.
7.  **Be Realistic:** The plan must be achievable. Don't cram too much into one day.
8.  **Output Format:** Return the entire plan in the specified JSON format. The 'schedule' array MUST contain exactly {{days}} entries.
`,
});

const generateTimetableFlow = ai.defineFlow(
  {
    name: 'generateTimetableFlow',
    inputSchema: GenerateTimetableInputSchema,
    outputSchema: GenerateTimetableOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


