
'use server';

import { ttsModel } from '@/ai/bytez';
import { z } from 'zod';

export type TextToSpeechInput = {
  text: string;
};

export type TextToSpeechOutput = {
  audioUrl: string | null;
};

export async function textToSpeech(input: TextToSpeechInput): Promise<TextToSpeechOutput> {
  try {
    const { error, output } = await ttsModel.run([{
      role: "user",
      content: input.text
    }]);

    if (error || !output) {
      console.error("TTS generation failed:", error);
      return { audioUrl: null };
    }

    // Bytez output for TTS usually returns a URL or base64. 
    // If it's base64 without prefix, we'll need to wrap it.
    const audioData = typeof output === 'string' ? output : (output as any).audio_url || (output as any).data;

    if (audioData?.startsWith('http')) {
      return { audioUrl: audioData };
    }

    return { audioUrl: audioData ? `data:audio/wav;base64,${audioData}` : null };
  } catch (error) {
    console.error("Text-to-speech generation failed:", error);
    return { audioUrl: null };
  }
}
