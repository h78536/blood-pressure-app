'use server';

// 定义 Cloudflare AI 绑定的接口
interface CloudflareAI {
  run(model: string, inputs: object): Promise<{ response: string }>;
}

/**
 * 调用 Cloudflare AI 模型进行医疗问题咨询。
 * @param question 用户提出的问题。
 * @param recentHistory 用户最近的血压读数摘要。
 * @returns AI 模型的响应字符串。
 */
export async function askMedicalQuestion(question: string, recentHistory: string): Promise<string> {
  // 在 Cloudflare Pages 中，绑定会自动注入到 process.env 中
  // 检查 AI 绑定是否在环境中可用
  if (!process.env.AI) {
    console.error("AI binding is not configured in Cloudflare environment.");
    return "抱歉，AI 服务未正确配置。请联系管理员。";
  }

  // 将 process.env.AI 强制转换为我们定义的接口类型
  const AI = process.env.AI as unknown as CloudflareAI;
  
  // 使用 @cf/mistral/mistral-7b-instruct-v0.1 模型
  const model = '@cf/mistral/mistral-7b-instruct-v0.1'; 

  try {
    const aiResponse = await AI.run(model, {
      messages: [
        { 
          role: 'system', 
          content: '你是一位专业的 AI 健康助手。你的回答应该严谨、富有同情心，并始终提醒用户你的建议不能替代专业医疗意见。请用简体中文回答。在你的回答末尾，你必须包含免责声明：“请注意：我是一个 AI 助手，我的回答不能替代执业医师的专业诊断。请咨询您的医生以获取专业的医疗建议。”' 
        },
        { 
          role: 'user', 
          content: `用户血压读数摘要: ${recentHistory}\n\n用户问题: "${question}"` 
        }
      ]
    });

    return aiResponse.response || "AI 未返回有效的响应。";

  } catch (error: any) {
    console.error("Error executing Cloudflare AI model:", error);
    // 提供更友好的用户错误信息
    if (error.message && error.message.includes('504')) {
        return "抱歉，AI模型响应超时，请稍后再试。";
    }
    if (error.message && error.message.includes('429')) {
        return "抱歉，AI请求过于频繁，已超出速率限制。请稍等片刻再试。";
    }
    return "抱歉，无法从 AI 模型获取响应。请检查 Cloudflare 上的模型绑定或稍后再试。";
  }
}
