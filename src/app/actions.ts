'use server';

import { getAI } from './ai-provider';

const systemPrompt = `你是一位专业的、富有同情心的健康顾问。请根据用户的问题，用简体中文提供清晰、易于理解的健康建议。
你的回答应该是建议性的，而不是诊断性的。始终提醒用户，AI建议不能替代专业医疗意见，如有需要应咨询医生。`;

export async function askMedicalQuestion(question: string): Promise<string> {
  const ai = getAI();
  if (!ai) {
    // 这个错误现在更通用，涵盖了所有无法获取 AI 绑定的情况
    return '抱歉，AI 服务当前不可用。请检查服务器配置或稍后再试。';
  }
  
  // 在 Cloudflare 环境中，模型标识符通常是从环境变量绑定的，而不是硬编码的
  // getAI() 函数已经处理了环境差异，我们直接使用它
  // 这里的 '@cf/meta/llama-3-8b-instruct' 是一个示例，实际模型在 Cloudflare Pages 设置中绑定
  try {
    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        { role: 'user', content: question },
      ],
    });

    if (typeof response.response === 'string') {
        return response.response;
    }
    return '抱歉，AI 返回了非预期的格式。';

  } catch (error: any) {
    console.error('Error calling Cloudflare AI:', error);
    return `抱歉，AI服务在处理您的请求时遇到问题。请稍后再试。`;
  }
}
