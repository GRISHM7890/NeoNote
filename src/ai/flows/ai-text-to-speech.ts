'use server';
/**
 * @fileOverview AI flow to convert text into high-quality speech.
 *
 * This flow takes a block of text and generates an audio file that can be played back.
 *
 * - textToSpeech - The main function to orchestrate the TTS generation.
 * - TextToSpeechInput - The input type for the flow.
 * - TextToSpeechOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import wav from 'wav';

// 1. Define Input/Output Schemas
export type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;
const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});

export type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;
const TextToSpeechOutputSchema = z.object({
  audioUrl: z.string().url().nullable().describe("A data URI string for the generated audio file (WAV format), or null if generation failed."),
});

// Helper function to convert raw PCM audio buffer to WAV format
async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', (d) => bufs.push(d));
    writer.on('end', () => resolve(Buffer.concat(bufs).toString('base64')));

    writer.write(pcmData);
    writer.end();
  });
}


// 2. Define the main flow
export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  try {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      prompt: input.text,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A standard, clear voice
          },
        },
      },
    });

    if (!media?.url) {
      console.error("TTS generation failed: No media returned.");
      return { audioUrl: null };
    }
    
    // The returned URL is a data URI with raw PCM data. We need to convert it to a playable format like WAV.
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    
    const wavBase64 = await toWav(audioBuffer);

    return { audioUrl: `data:audio/wav;base64,${wavBase64}` };

  } catch (error) {
    console.error("Text-to-speech generation failed:", error);
    return { audioUrl: null };
  }
}
