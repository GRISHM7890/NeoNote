
'use server';

import { model } from '@/ai/bytez';
import { z } from 'zod';

// 1. Define Input/Output Schemas
export type GenerateChapterFullPackageInput = z.infer<typeof GenerateChapterFullPackageInputSchema>;
const GenerateChapterFullPackageInputSchema = z.object({
  chapterName: z.string(),
  className: z.string(),
  subject: z.string(),
  board: z.string(),
});

const PYQSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export type GenerateChapterFullPackageOutput = z.infer<typeof GenerateChapterFullPackageOutputSchema>;
const GenerateChapterFullPackageOutputSchema = z.object({
  summary: z.string(),
  notes: z.string(),
  pyqs: z.array(PYQSchema),
});

// 2. Export a wrapper function for client-side use
export async function generateChapterFullPackage(input: GenerateChapterFullPackageInput): Promise<GenerateChapterFullPackageOutput> {
  const prompt = `
You are a master educator AI. Your task is to generate a comprehensive study package for the following chapter:
- **Board:** ${input.board}
- **Class:** ${input.className}
- **Subject:** ${input.subject}
- **Chapter:** ${input.chapterName}

Your response MUST be a valid JSON object with the following structure:
{
  "summary": "A comprehensive summary of the chapter.",
  "notes": "Detailed notes with markdown formatting.",
  "pyqs": [
    { "question": "Question 1", "answer": "Answer 1" },
    ...
  ]
}

Ensure you provide at least 15-20 high-quality Previous Year Questions (PYQs).
Return ONLY the JSON object.
`;

  const { error, output } = await model.run([{
    role: "user",
    content: prompt
  }]);

  if (error) {
    throw new Error(`Bytez AI Error: ${JSON.stringify(error)}`);
  }

  try {
    // Clean output in case the model wraps it in markdown blocks
    const cleanOutput = typeof output === 'string' ? output.replace(/```json|```/g, '').trim() : JSON.stringify(output);
    const result = JSON.parse(cleanOutput);
    return GenerateChapterFullPackageOutputSchema.parse(result);
  } catch (e) {
    console.error("Failed to parse Bytez output:", output);
    throw new Error('The AI failed to generate a valid study package structure. Please try again.');
  }
}
