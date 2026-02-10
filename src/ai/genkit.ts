import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({ apiKey: 'AIzaSyAaFO2WZsyltf02_OVO6NJg6TvtKoI1d_Y' })],
  model: 'googleai/gemini-2.0-flash',
});
