// 优化后的 askMedicalQuestion 函数
export async function askMedicalQuestion(question: string, recentHistory: string): Promise<string> {
  const API_KEY = process.env.ZHIPU_API_KEY;
  
  if (!API_KEY) {
    console.error("ZHIPU_API_KEY is not configured");
    return "AI服务配置有误，请检查API密钥设置。";
  }

  // 使用更快的模型和超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000); // 45秒超时

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-3-turbo', // 改用更快的模型
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的AI健康助手，请用简体中文回答。请遵循：1. 基于提供的血压数据进行分析 2. 不要编造不存在的信息 3. 回答要简洁明了 4. 最后加上："请注意：我是AI助手，建议仅供参考，请咨询专业医生。"' 
          },
          { 
            role: 'user', 
            content: `血压数据：${recentHistory}\n问题：${question}\n请简要回答：` 
          }
        ],
        temperature: 0.7,
        max_tokens: 600, // 减少长度，加快响应
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('智谱API错误:', response.status, errorText);
      
      // 更友好的错误提示
      if (response.status === 429) {
        return "AI服务使用过于频繁，请稍等一分钟再试。";
      } else if (response.status === 401) {
        return "API密钥无效，请检查配置。";
      }
      return "AI服务暂时繁忙，请稍后重试。";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "已收到您的分析请求。";

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("智谱AI调用错误:", error);
    
    if (error.name === 'AbortError') {
      return "智谱AI响应较慢，请求已超时（45秒）。请简化问题或稍后重试。";
    }
    return "无法连接到AI服务，请检查网络连接。";
  }
}