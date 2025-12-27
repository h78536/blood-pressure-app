'use server';

import { getRequestContext } from '@cloudflare/next-on-pages';

// A type-safe interface for the AI model binding.
interface AI {
  run(model: string, inputs: { system: string; prompt: string }): Promise<{ response: string }>;
}

const systemPrompt = `你是一位专业的、富有同情心的健康顾问。请根据用户的问题，用简体中文提供清晰、易于理解的健康建议。
你的回答应该是建议性的，而不是诊断性的。始终提醒用户，AI建议不能替代专业医疗意见，如有需要应咨询医生。`;

export async function askMedicalQuestion(question: string): Promise<string> {
  try {
    // This is the correct and safe way to get the AI binding within a Server Action.
    const { env } = getRequestContext();
    const ai = (env as any).AI as AI;

    if (!ai) {
      // This case should ideally not be hit if the binding is set up correctly in Cloudflare.
      throw new Error('AI binding is not configured in the Cloudflare environment.');
    }

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
        system: systemPrompt,
        prompt: `用户的问题是：${question}`,
    });

    // Ensure we return a string, providing a fallback if the response format is unexpected.
    if (typeof response.response === 'string') {
        return response.response;
    }
    return '抱歉，AI返回了非预期的格式。';

  } catch (error: any) {
    console.error('Error calling Cloudflare AI:', error);
    // Provide a user-friendly error message back to the frontend.
    return `抱歉，AI服务在处理您的请求时遇到问题。详情: ${error.message}`;
  }
}
