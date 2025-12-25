'use server';
/**
 * @fileOverview A flow for summarizing blood pressure trends.
 *
 * - summarizeBloodPressureTrends - A function that handles the summarization.
 * - SummarizeBloodPressureTrendsInput - The input type for the function.
 * - SummarizeBloodPressureTrendsOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeBloodPressureTrendsInputSchema = z.object({
  readings: z.array(
    z.object({
      id: z.string(),
      systolic: z.number(),
      diastolic: z.number(),
      pulse: z.number(),
      timestamp: z.string(),
    })
  ),
  period: z.enum(['weekly', 'monthly', 'all-time']),
});

export type SummarizeBloodPressureTrendsInput = z.infer<
  typeof SummarizeBloodPressureTrendsInputSchema
>;
export type SummarizeBloodPressureTrendsOutput = string;

const prompt = ai.definePrompt(
  {
    name: 'summarizeBloodPressureTrendsPrompt',
    input: { schema: SummarizeBloodPressureTrendsInputSchema },
    output: { format: 'text' },
    prompt: `你是一位专业的健康顾问，正在为用户分析他们的血压数据。请根据用户在 {{period}} 内的血压记录，用简体中文生成一段简短（2-3句话）的总结和建议。

你的语气应该专业、鼓励且易于理解。

这是用户的血压记录（收缩压/舒张压/脉搏/时间戳）：
{{#each readings}}
- {{systolic}}/{{diastolic}}/{{pulse}} @ {{timestamp}}
{{/each}}

请根据这些数据，总结用户的整体血压趋势（例如：稳定在理想范围、偏高、有波动等），并给出一个简单、可行的生活方式建议。如果数据很少，请谨慎措辞。`,
  },
);

const summarizeFlow = ai.defineFlow(
  {
    name: 'summarizeBloodPressureTrendsFlow',
    inputSchema: SummarizeBloodPressureTrendsInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);


export async function summarizeBloodPressureTrends(
  input: SummarizeBloodPressureTrendsInput
): Promise<SummarizeBloodPressureTrendsOutput> {
  return summarizeFlow(input);
}