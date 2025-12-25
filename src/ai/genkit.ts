'use server';

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [
    googleAI(),
  ],
  // 在生产环境中允许调用模型
  allowCycles: true,
});
