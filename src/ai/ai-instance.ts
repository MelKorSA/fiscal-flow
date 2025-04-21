import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { EventEmitter } from 'events';

// Increase the max listeners to prevent warnings
EventEmitter.defaultMaxListeners = 15;

// Log API key presence check
const apiKey = process.env.GOOGLE_GENAI_API_KEY;
if (!apiKey) {
  console.warn("AI Instance: GOOGLE_GENAI_API_KEY environment variable not found!");
} else {
  console.log("AI Instance: GOOGLE_GENAI_API_KEY seems to be present."); // Don't log the key itself
}

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({
      apiKey: apiKey, // Use the variable
    }),
  ],
  model: 'googleai/gemini-2.0-flash',
});
