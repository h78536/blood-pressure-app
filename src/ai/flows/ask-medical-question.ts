'use server';
/**
 * @fileOverview 一个用于医疗问题咨询的AI流程。
 *
 * - askMedicalQuestion - 处理医疗问题咨询的函数。
 * - AskMedicalQuestionInputSchema - 函数的输入类型。
 * - AskMedicalQuestionOutput - 函数的返回类型。
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const AskMedicalQuestionInputSchema = z.object({
  question: z.string().describe("用户关于血压的问题。"),
  recentHistory: z.string().describe("用户最近的血压读数摘要。"),
});

export type AskMedicalQuestionInput = z.infer<typeof AskMedicalQuestionInputSchema>;
export type AskMedicalQuestionOutput = string;

const prompt = ai.definePrompt(
  {
    name: 'askMedicalQuestionPrompt',
    input: { schema: AskMedicalQuestionInputSchema },
    output: { format: 'text' },
    prompt: `你是一位专业的AI健康助手。你的回答应该严谨、富有同情心，并始终提醒用户你的建议不能替代专业医疗意见。请用简体中文回答。

用户的血压读数摘要: {{{recentHistory}}}

用户问题: "{{{question}}}"

在你的回答末尾，你必须包含免责声明：“请注意：我是一个AI助手，我的回答不能替代执业医师的专业诊断。请咨询您的医生以获取专业的医疗建议。”`,
  },
);

const askMedicalQuestionFlow = ai.defineFlow(
  {
    name: 'askMedicalQuestionFlow',
    inputSchema: AskMedicalQuestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function askMedicalQuestion(
  input: AskMedicalQuestionInput
): Promise<AskMedicalQuestionOutput> {
  return askMedicalQuestionFlow(input);
}
