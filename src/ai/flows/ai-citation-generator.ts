
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

export type GenerateCitationsInput = z.infer<typeof GenerateCitationsInputSchema>;
const GenerateCitationsInputSchema = z.object({
  text: z.string().describe("The block of text from which to generate citations. This text may mention books, articles, websites, etc."),
  style: z.enum(['MLA', 'APA', 'Chicago', 'Harvard']).describe("The desired citation style."),
});


const CitationSchema = z.object({
  sourceType: z.string().describe("The type of source identified (e.g., 'Book', 'Journal Article', 'Website')."),
  formattedCitation: z.string().describe("The fully formatted citation in the requested style. Use HTML for proper formatting like italics (<i>Title</i>)."),
  verificationNotes: z.string().describe("A brief note on how the AI verified the source or any assumptions made (e.g., 'Assumed publication year based on context', 'Verified author name via web search')."),
});

export type GenerateCitationsOutput = z.infer<typeof GenerateCitationsOutputSchema>;
const GenerateCitationsOutputSchema = z.object({
  citations: z.array(CitationSchema).describe('An array of all citations found and formatted from the text.'),
});


// 2. Define the AI prompt for citation generation
const generateCitationsPrompt = ai.definePrompt({
  name: 'generateCitationsPrompt',
  input: { schema: GenerateCitationsInputSchema },
  output: { schema: GenerateCitationsOutputSchema },
  prompt: `You are an expert AI Librarian and Citation Specialist with web search capabilities. Your task is to analyze a given block of text, identify any potential academic sources, verify their details online, and generate perfectly formatted citations.

**Citation Style Required:** {{{style}}}

**Source Text to Analyze:**
---
{{{text}}}
---

**Your Task (Follow these steps precisely):**

1.  **Identify Potential Sources:**
    *   Carefully read the text and identify every potential source. Look for clues like author names, titles in quotes or italics, publication years, organization names, or URLs.
    *   Sources can be books, articles, websites, research papers, etc.

2.  **Verify and Augment with Web Search:**
    *   For each potential source you identify, use your web search capabilities to find the full, correct details.
    *   Search for the author, title, publication date, publisher, journal name, volume, issue, page numbers, URL, DOI, etc.
    *   Prioritize finding official sources like publisher websites, academic databases (e.g., Google Scholar), or official organizational sites.

3.  **Format the Citation:**
    *   Using the verified and augmented information, format each source into a perfect citation according to the **{{{style}}}** style guide.
    *   Use HTML tags for formatting where necessary (e.g., \`<i>\` for titles in MLA/APA).
    *   This formatted string goes into the **formattedCitation** field.

4.  **Add Verification Notes:**
    *   For each citation, provide a brief note in the **verificationNotes** field explaining how you verified the source.
    *   Example: "Verified author and publication year via Google Books listing for the title." or "Information taken directly from the provided URL's metadata." or "Could not definitively verify the publisher; using the most likely candidate based on search results."

5.  **Compile the List:**
    *   Add each completed citation object to the 'citations' array.
    *   If, after searching, you find no citable sources, return an empty array. Do not hallucinate sources.

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
