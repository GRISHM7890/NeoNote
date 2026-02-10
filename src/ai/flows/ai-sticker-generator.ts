
'use server';

import { imageModel } from '@/ai/bytez';
import { z } from 'zod';

export type GenerateStickersInput = {
  topic: string;
};

export type GenerateStickersOutput = {
  stickerSheetUrl: string | null;
};

export async function generateStickers(input: GenerateStickersInput): Promise<GenerateStickersOutput> {
  const imagePrompt = `A sticker sheet of 6 cute, vector art stickers about '${input.topic}'. White border, die-cut style. Colorful and students-friendly.`;

  try {
    const { error, output } = await imageModel.run([{
      role: "user",
      content: imagePrompt
    }]);

    if (error || !output) {
      console.error("Sticker generation failed:", error);
      return { stickerSheetUrl: null };
    }

    const url = typeof output === 'string' ? output : (output as any).url;
    return { stickerSheetUrl: url || null };
  } catch (error) {
    console.error("Sticker generation AI call failed:", error);
    return { stickerSheetUrl: null };
  }
}
