
'use server';
/**
 * @fileOverview AI flow to parse natural language voice commands.
 *
 * This flow takes a transcribed text command from a user and determines the
 * intended action and any associated parameters (entities).
 *
 * - parseVoiceCommand - The main function to orchestrate the command parsing.
 * - ParseCommandInput - The input type for the flow.
 * - ParseCommandOutput - The return type for the flow, which is a union of possible commands.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define the schemas for each possible command the user can issue.

const CreateNotesCommandSchema = z.object({
  action: z.literal('create_notes').describe('The user wants to create a new note.'),
  topic: z.string().describe('The topic for the notes, extracted from the command.'),
});

const CreateQuizCommandSchema = z.object({
  action: z.literal('create_quiz').describe('The user wants to create a new quiz or question bank.'),
  topic: z.string().describe('The topic for the quiz, extracted from the command.'),
  questionCount: z.number().int().optional().describe('The number of questions, if specified.'),
});

const OpenToolCommandSchema = z.object({
    action: z.literal('open_tool').describe('The user wants to navigate to a specific tool in the app.'),
    toolName: z.string().describe('The name of the tool to open, extracted from the command. Should be one of the known tool names.'),
});

const UnknownCommandSchema = z.object({
    action: z.literal('unknown').describe('The command could not be understood or does not match any known actions.'),
    originalCommand: z.string().describe('The original text of the command that could not be parsed.'),
});


// 2. Create a union schema of all possible command outputs.
const ParseCommandOutputSchema = z.union([
    CreateNotesCommandSchema,
    CreateQuizCommandSchema,
    OpenToolCommandSchema,
    UnknownCommandSchema,
]);

export type ParseCommandOutput = z.infer<typeof ParseCommandOutputSchema>;

export type ParseCommandInput = z.infer<typeof ParseCommandInputSchema>;
const ParseCommandInputSchema = z.object({
  commandText: z.string().describe("The user's spoken command, transcribed into text."),
});

// 3. Define the AI prompt for parsing the command.
const prompt = ai.definePrompt({
  name: 'parseVoiceCommandPrompt',
  input: { schema: ParseCommandInputSchema },
  output: { schema: ParseCommandOutputSchema },
  prompt: `You are an expert command interpreter for a student productivity app. Your task is to analyze the user's transcribed voice command and determine their intent and any relevant parameters.

**Available Actions:**
- **create_notes**: Triggered when the user wants to make new notes. Requires a 'topic'.
- **create_quiz**: Triggered when the user wants to generate a quiz, mock test, or question bank. Requires a 'topic'.
- **open_tool**: Triggered when the user wants to open a specific feature or tool. Requires a 'toolName'.

**Instructions:**
1. Analyze the command: \`{{{commandText}}}\`
2. Determine which action the user intends to perform.
3. Extract the required parameters (e.g., 'topic', 'toolName').
4. If the command is unclear or doesn't match any available actions, you MUST return the 'unknown' action. Do not try to guess.

**Examples:**
- "Make notes on Laws of Motion" -> { action: 'create_notes', topic: 'Laws of Motion' }
- "Create a quiz for Trigonometry" -> { action: 'create_quiz', topic: 'Trigonometry' }
- "Open the doubt solver" -> { action: 'open_tool', toolName: 'Doubt Solver Bot' }
- "What's the weather like?" -> { action: 'unknown', originalCommand: "What's the weather like?" }

Return the result in the specified JSON format.
`,
});

// 4. Define the main flow.
const parseVoiceCommandFlow = ai.defineFlow(
  {
    name: 'parseVoiceCommandFlow',
    inputSchema: ParseCommandInputSchema,
    outputSchema: ParseCommandOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('The AI failed to parse the command.');
    }
    return output;
  }
);

// 5. Export a wrapper function for client-side use.
export async function parseVoiceCommand(input: ParseCommandInput): Promise<ParseCommandOutput> {
  return parseVoiceCommandFlow(input);
}
