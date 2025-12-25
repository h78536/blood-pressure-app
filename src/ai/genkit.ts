'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

//
// This is the most basic Genkit configuration, which is the most robust
// in production environments like Vercel.
//
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
