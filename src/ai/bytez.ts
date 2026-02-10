import Bytez from "bytez.js";
import { z } from "zod";

// Credentials from the user's provided screenshot
const BYIEZ_API_KEY = "a3e5045bb3b0ddabbd9024bbb4694f53";
const TEXT_MODEL_NAME = "openai/gpt-oss-20b";
const IMAGE_MODEL_NAME = "black-forest-labs/flux-1-dev";

export const bytez = new Bytez(BYIEZ_API_KEY);
export const model = bytez.model(TEXT_MODEL_NAME);
export const imageModel = bytez.model(IMAGE_MODEL_NAME);
export const sttModel = bytez.model("openai/whisper-large-v3");
export const ttsModel = bytez.model("hexgrad/Kokoro-82M");

/**
 * Helper to run simple text generation prompts.
 */
export async function runPrompt(prompt: string) {
    const { error, output } = await model.run([{
        role: "user",
        content: prompt
    }]);

    if (error) {
        throw new Error(`Bytez AI Error: ${JSON.stringify(error)}`);
    }

    return output;
}

/**
 * Helper to parse and validate JSON output.
 */
function parseJsonOutput<T>(output: any, schema: z.ZodSchema<T>): T {
    try {
        const cleanOutput = typeof output === 'string'
            ? output.replace(/```json|```/g, '').trim()
            : JSON.stringify(output);
        const result = JSON.parse(cleanOutput);
        return schema.parse(result);
    } catch (e) {
        console.error("Bytez Parsing Failed. Output:", output);
        throw new Error('The AI failed to generate a valid data structure. Please try again.');
    }
}

/**
 * Helper to run structured output prompts with text-only model.
 */
export async function runStructuredPrompt<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const { error, output } = await model.run([{
        role: "user",
        content: `${prompt}\n\nIMPORTANT: Return ONLY a valid JSON object. No extra text, no markdown code blocks.`
    }]);

    if (error) {
        throw new Error(`Bytez AI Error: ${JSON.stringify(error)}`);
    }

    return parseJsonOutput(output, schema);
}
