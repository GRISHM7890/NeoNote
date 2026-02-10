
'use server';

import { runStructuredVisionPrompt } from '@/ai/bytez';
import { z } from 'zod';

const OrganizeHomeworkOutputSchema = z.object({
  subject: z.string(),
  taskSummary: z.string(),
  priority: z.enum(['High', 'Medium', 'Low']),
});
export type OrganizeHomeworkOutput = z.infer<typeof OrganizeHomeworkOutputSchema>;

export type OrganizeHomeworkInput = {
  dueDate: string;
  inputText?: string;
  photoDataUri?: string;
};

export async function organizeHomework(input: OrganizeHomeworkInput): Promise<OrganizeHomeworkOutput> {
  const prompt = `
Organize this homework due ${input.dueDate}.
Text description: ${input.inputText || "No text provided"}
Please analyze the image if provided to extract specific tasks and the subject.
`;

  return runStructuredVisionPrompt(prompt, input.photoDataUri, OrganizeHomeworkOutputSchema);
}
