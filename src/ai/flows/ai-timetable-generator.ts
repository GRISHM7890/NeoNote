
'use server';

import { runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

const StudySessionSchema = z.object({
  subject: z.string(),
  topic: z.string(),
});

const DailyPlanSchema = z.object({
  day: z.number().int(),
  sessions: z.array(StudySessionSchema),
});

const GenerateTimetableOutputSchema = z.object({
  title: z.string().optional(),
  schedule: z.array(DailyPlanSchema),
});
export type GenerateTimetableOutput = z.infer<typeof GenerateTimetableOutputSchema>;

export type GenerateTimetableInput = {
  subjects: string[];
  days: number;
  hoursPerDay: number;
  examName?: string;
};

export async function generateTimetable(input: GenerateTimetableInput): Promise<GenerateTimetableOutput> {
  const prompt = `
Generate a study plan for:
Exam: ${input.examName || "General"}
Subjects: ${input.subjects.join(", ")}
Duration: ${input.days} days
Daily hours: ${input.hoursPerDay}
`;

  return runStructuredPrompt(prompt, GenerateTimetableOutputSchema);
}
