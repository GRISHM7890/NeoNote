
'use server';

import { sttModel, runStructuredPrompt } from '@/ai/bytez';
import { z } from 'zod';

export type ProcessVoiceNoteInput = {
  audioDataUri: string;
};

const ProcessVoiceNoteOutputSchema = z.object({
  rawTranscript: z.string(),
  formattedNotes: z.string(),
});
export type ProcessVoiceNoteOutput = z.infer<typeof ProcessVoiceNoteOutputSchema>;

export async function processVoiceNote(input: ProcessVoiceNoteInput): Promise<ProcessVoiceNoteOutput> {
  try {
    // 1. Transcription using Bytez STT
    const { error, output } = await sttModel.run([{
      role: "user",
      // Most Bytez models expect image/audio as part of content or specific input
      content: `Transcribe this audio: ${input.audioDataUri}`
    }]);

    if (error || !output) {
      throw new Error(`STT failed: ${JSON.stringify(error)}`);
    }

    const transcript = typeof output === 'string' ? output : (output as any).text;

    // 2. Formatting using Bytez Text Model
    const formatPrompt = `
Format this school transcript into structured markdown notes with titles, bullet points, and key takeaways:
---
${transcript}
---
`;

    const formattingResult = await runStructuredPrompt(formatPrompt, z.object({ formattedNotes: z.string() }));

    return {
      rawTranscript: transcript,
      formattedNotes: formattingResult.formattedNotes,
    };
  } catch (error) {
    console.error("Voice note processing failed:", error);
    return {
      rawTranscript: "Transcription failed.",
      formattedNotes: "Could not generate notes."
    };
  }
}
