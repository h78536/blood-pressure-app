'use server';
/**
 * @fileOverview An AI flow for answering general medical questions.
 *
 * - askMedicalQuestion - A function that handles the Q&A.
 * - AskMedicalQuestionInput - The input type for the function.
 * - AskMedicalQuestionOutput - The return type for the function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AskMedicalQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s medical or health-related question.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The previous conversation history.'),
});

export type AskMedicalQuestionInput = z.infer<
  typeof AskMedicalQuestionInputSchema
>;
export type AskMedicalQuestionOutput = string;

const prompt = ai.definePrompt(
  {
    name: 'askMedicalQuestionPrompt',
    input: { schema: AskMedicalQuestionInputSchema },
    output: { format: 'text' },
    prompt: `你是一名专业的AI健康顾问。你的回答必须严谨、科学，并始终强调你不能替代执业医师的诊断。

用户的提问是： "{{question}}"

在回答用户问题时，请遵循以下规则：
1. **安全第一**：在回答的开头，必须包含一句明确的免责声明：“请注意：我是一个AI模型，我的建议不能替代专业医疗诊断。如有具体健康问题，请务必咨询医生。”
2. **基于问题回答**：清晰、简洁地回答用户提出的问题。
3. **鼓励积极行为**：在回答的结尾，鼓励用户记录相关数据或采取健康的生活方式。
4. **保持对话性**：如果提供了聊天历史，请根据上下文进行回答。

{{#if history}}
这是之前的对话内容：
{{#each history}}
- {{role}}: {{content}}
{{/each}}
{{/if}}
`,
  },
);

const askFlow = ai.defineFlow(
  {
    name: 'askMedicalQuestionFlow',
    inputSchema: AskMedicalQuestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // This is a robust error handling block for the server-side flow.
    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is not configured on the server.');
      }
      const { output } = await prompt(input);
      if (!output) {
        throw new Error('AI returned an empty response.');
      }
      return output;
    } catch (e: any) {
      console.error('[askMedicalQuestionFlow Error]', e);
      // Return the specific error message as a string to be displayed in the UI
      return `[SERVER_ERROR] Failed to execute AI flow: ${e.message || 'An unknown error occurred.'}`;
    }
  }
);


export async function askMedicalQuestion(
  input: AskMedicalQuestionInput
): Promise<AskMedicalQuestionOutput> {
  // This outer try-catch handles any errors that might occur outside the flow itself.
  try {
    return await askFlow(input);
  } catch (e: any) {
    console.error('[askMedicalQuestion Handler Error]', e);
    return `[HANDLER_ERROR] An unexpected error occurred: ${e.message || 'Unknown error.'}`;
  }
}
