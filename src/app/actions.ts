'use server';

interface CloudflareAI {
  run(model: string, inputs: object): Promise<{ response: string }>;
}

export async function askMedicalQuestion(question: string, recentHistory: string): Promise<string> {
  if (!process.env.AI) {
    throw new Error("AI binding is not configured. Please check your Cloudflare environment settings.");
  }

  const AI = process.env.AI as unknown as CloudflareAI;
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
    console.error("Error running Cloudflare AI:", error);
    if (error.message && error.message.includes('504')) {
        return "抱歉，AI模型响应超时。请稍后再试。";
    }
    if (error.message && error.message.includes('429')) {
        return "抱歉，AI请求过于频繁，已超出速率限制。请稍等片刻再试。";
    }
    return "抱歉，无法从 AI 模型获取响应。请检查 Cloudflare 上的模型绑定或稍后再试。";
  }
}
