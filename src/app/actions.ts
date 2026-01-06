// 替换 askMedicalQuestion 函数
export async function askMedicalQuestion(question: string, recentHistory: string): Promise<string> {
  const API_KEY = process.env.ZHIPU_API_KEY;
  
  if (!API_KEY) {
    console.error("ZHIPU_API_KEY is not configured");
    return "AI服务配置有误，请检查API密钥设置。";
  }

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的AI健康助手，请用简体中文回答。基于提供的血压数据进行分析，不要编造不存在的信息。在回答末尾添加："请注意：我是一个AI助手，我的回答不能替代执业医师的专业诊断。请咨询您的医生以获取专业的医疗建议。"' 
          },
          { 
            role: 'user', 
            content: `【血压记录】\n${recentHistory}\n\n【用户问题】\n${question}\n\n请基于上述血压记录回答问题，如果记录中没有某项数据请说明"记录中未显示"。` 
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('智谱API错误:', response.status, errorText);
      return "AI服务暂时不可用，请稍后重试。";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "AI未返回有效响应。";

  } catch (error: any) {
    console.error("智谱AI调用错误:", error);
    if (error.name === 'AbortError') {
      return "请求超时，请检查网络连接。";
    }
    return "无法连接到AI服务，请稍后再试。";
  }
}