
'use server';
/**
 * @fileOverview AI flow to process recorded audio into formatted study notes.
 *
 * This flow performs two main steps:
 * 1. Transcribes the audio data into raw text using a speech-to-text model.
 * 2. Takes the raw transcript and formats it into structured, markdown-style notes.
 *
 * - processVoiceNote - The main function to orchestrate the transcription and formatting.
 * - ProcessVoiceNoteInput - The input type for the flow.
 * - ProcessVoiceNoteOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

// 1. Define Input/Output Schemas
const ProcessVoiceNoteInputSchema = z.object({
  audioDataUri: z.string().describe(
    "The recorded audio as a data URI. Expected format: 'data:audio/webm;base64,...'"
  ),
});
export type ProcessVoiceNoteInput = z.infer<typeof ProcessVoiceNoteInputSchema>;

const ProcessVoiceNoteOutputSchema = z.object({
  rawTranscript: z.string().describe('The raw text transcribed from the audio.'),
  formattedNotes: z.string().describe('The AI-formatted, structured study notes in Markdown format.'),
});
export type ProcessVoiceNoteOutput = z.infer<typeof ProcessVoiceNoteOutputSchema>;

// 2. Define the AI prompt for transcription
const transcribeAudioPrompt = ai.definePrompt({
    name: 'transcribeAudioPrompt',
    input: { schema: ProcessVoiceNoteInputSchema },
    output: { schema: z.object({ transcript: z.string() }) },
    prompt: `Transcribe the following audio recording into text. Provide only the raw text.
    
    Audio: {{media url=audioDataUri}}`,
    model: googleAI.model('gemini-1.5-flash'),
});


// 3. Define the AI prompt for formatting the transcript
const formatNotesPrompt = ai.definePrompt({
  name: 'formatNotesPrompt',
  input: { schema: z.string() }, // Input is the raw transcript text
  output: { schema: z.object({ formattedNotes: z.string() }) },
  prompt: `You are an expert academic note-taker. Your task is to take a raw, unstructured text transcript and format it into clear, well-organized study notes.

Use the following formatting rules:
- Use Markdown for structure.
- Create a concise, relevant title for the notes (e.g., "### Title of Notes").
- Use headings (like "#### Key Concepts") to organize sections.
- Use bullet points (-) for lists or key ideas.
- Use bold text (**word**) to highlight important keywords or definitions.
- Summarize the main points at the end under a "#### Key Takeaways" heading.
- Correct any obvious transcription errors if the context allows.

Here is the raw transcript:
---
{{{input}}}
---

Produce the formatted notes.`,
});


// 4. Define the main flow
const processVoiceNoteFlow = ai.defineFlow(
  {
    name: 'processVoiceNoteFlow',
    inputSchema: ProcessVoiceNoteInputSchema,
    outputSchema: ProcessVoiceNoteOutputSchema,
  },
  async (input) => {
    // Step 1: Transcribe audio to text
    const { output: transcriptionResult } = await transcribeAudioPrompt(input);
    
    if (!transcriptionResult?.transcript) {
      throw new Error('Transcription failed. The AI did not return any text.');
    }

    const rawTranscript = transcriptionResult.transcript;

    // Step 2: Format the raw transcript into notes
    const { output: formattingResult } = await formatNotesPrompt(rawTranscript);

    if (!formattingResult?.formattedNotes) {
        throw new Error('Note formatting failed. The AI did not return formatted notes.');
    }

    return {
      rawTranscript,
      formattedNotes: formattingResult.formattedNotes,
    };
  }
);

// 5. Export a wrapper function for client-side use
export async function processVoiceNote(input: ProcessVoiceNoteInput): Promise<ProcessVoiceNoteOutput> {
  return processVoiceNoteFlow(input);
}
