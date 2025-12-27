'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const AskMedicalQuestionInputSchema = z.object({
  question: z.string().describe("The user's question about their blood pressure."),
  readingsContext: z.string().describe("A summary of the user's recent blood pressure readings."),
});

export type AskMedicalQuestionInput = z.infer<typeof AskMedicalQuestionInputSchema>;
export type AskMedicalQuestionOutput = string;

const medicalPrompt = ai.definePrompt(
  {
    name: 'medicalQuestionPrompt',
    input: { schema: AskMedicalQuestionInputSchema },
    output: { format: 'text' },
    prompt: `You are a professional AI health assistant. Your answers should be rigorous, compassionate, and always remind the user that your advice is not a substitute for a professional medical opinion. Please answer in Simplified Chinese.

User's Blood Pressure Reading Summary:
{{{readingsContext}}}

User's Question:
"{{{question}}}"

Please answer the user's question based on the information above. At the end of your answer, you MUST include the disclaimer: "Please note: I am an AI assistant, and my answers cannot replace a professional diagnosis from a licensed physician. Please consult your doctor for professional medical advice."`,
  },
);

const askMedicalQuestionFlow = ai.defineFlow(
  {
    name: 'askMedicalQuestionFlow',
    inputSchema: AskMedicalQuestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await medicalPrompt(input);
    return output!;
  }
);


export async function askMedicalQuestion(
  input: AskMedicalQuestionInput
): Promise<AskMedicalQuestionOutput> {
  return askMedicalQuestionFlow(input);
}
