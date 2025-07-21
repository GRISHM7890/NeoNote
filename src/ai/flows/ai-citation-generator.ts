
'use server';
/**
 * @fileOverview AI flow to analyze text, identify sources, and generate academic citations.
 *
 * This flow acts as an AI librarian, extracting source information from unstructured text
 * and formatting it into a requested citation style.
 *
 * - generateCitations - The main function to orchestrate the citation generation.
 * - GenerateCitationsInput - The input type for the flow.
 * - GenerateCitationsOutput - The return type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// 1. Define Input/Output Schemas

const GenerateCitationsInputSchema = z.object({
  text: z.string().describe("The block of text from which to generate citations. This text may mention books, articles, websites, etc."),
  style: z.enum(['MLA', 'APA', 'Chicago', 'Harvard']).describe("The desired citation style."),
});
export type GenerateCitationsInput = z.infer<typeof GenerateCitationsInputSchema>;


const CitationSchema = z.object({
  sourceType: z.string().describe("The type of source identified (e.g., 'Book', 'Journal Article', 'Website')."),
  formattedCitation: z.string().describe("The fully formatted citation in the requested style. Use HTML for proper formatting like italics (<i>Title</i>)."),
  verificationNotes: z.string().describe("A brief note on how the AI verified the source or any assumptions made (e.g., 'Assumed publication year based on context', 'Verified author name via web search')."),
});

const GenerateCitationsOutputSchema = z.object({
  citations: z.array(CitationSchema).describe('An array of all citations found and formatted from the text.'),
});
export type GenerateCitationsOutput = z.infer<typeof GenerateCitationsOutputSchema>;


// 2. Define the AI prompt for citation generation
const generateCitationsPrompt = ai.definePrompt({
  name: 'generateCitationsPrompt',
  input: { schema: GenerateCitationsInputSchema },
  output: { schema: GenerateCitationsOutputSchema },
  prompt: `You are an expert AI Librarian and Citation Specialist. Your task is to analyze a given block of text, identify any potential academic sources mentioned, and generate perfectly formatted citations in the requested style.

**Citation Style Required:** {{{style}}}

**Source Text:**
---
{{{text}}}
---

**Your Task (Follow these steps precisely):**

1.  **Identify All Sources:** Carefully read the text and identify every potential source mentioned. This could be a book, an article by an author, a website, a research paper, etc.
2.  **Extract Key Information:** For each source, extract as much information as possible: author(s), title, publication year, journal name, publisher, URL, etc.
3.  **Verify & Format:**
    *   Use your knowledge to fill in any missing gaps if possible (e.g., a common book's publisher).
    *   Format each identified source into a perfect citation according to the **{{{style}}}** style guide. Use HTML tags for formatting where necessary (e.g., \`<i>\` for titles in MLA/APA).
    *   This formatted string goes into the **formattedCitation** field.
4.  **Add Verification Notes:** For each citation, provide a brief note in the **verificationNotes** field explaining your confidence or any assumptions made. For example: "Author and year were clearly stated," or "Could not verify publisher; using general information."
5.  **Compile the List:** Add each completed citation object to the 'citations' array. If no sources are found, return an empty array.

Return the entire analysis in the specified JSON format.
`,
});

// 3. Define the main flow
const generateCitationsFlow = ai.defineFlow(
  {
    name: 'generateCitationsFlow',
    inputSchema: GenerateCitationsInputSchema,
    outputSchema: GenerateCitationsOutputSchema,
  },
  async (input) => {
    const { output } = await generateCitationsPrompt(input);
    if (!output) {
      throw new Error('The AI failed to generate citations. Please try again.');
    }
    return output;
  }
);

// 4. Export a wrapper function for client-side use
export async function generateCitations(input: GenerateCitationsInput): Promise<GenerateCitationsOutput> {
  return generateCitationsFlow(input);
}
