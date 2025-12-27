import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { question, readingsContext } = await request.json();

    // 1. 从环境变量读取百度千帆的密钥 (我们之后会在Vercel里设置 QIANFAN_API_KEY 和 QIANFAN_SECRET_KEY)
    const API_KEY = process.env.QIANFAN_API_KEY;
    const SECRET_KEY = process.env.QIANFAN_SECRET_KEY;

    if (!API_KEY || !SECRET_KEY) {
      return NextResponse.json({ 
        response: 'AI服务配置有误，请检查后台设置。' 
      }, { status: 500 });
    }

    // 2. 百度千帆需要先获取Access Token
    const tokenResponse = await fetch(
      `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${API_KEY}&client_secret=${SECRET_KEY}`,
      { method: 'POST' }
    );
    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('获取百度千帆访问令牌失败');
    }

    // 3. 构建和OpenAI类似的对话请求
    const systemPrompt = `你是一个专业、细心的医疗健康助手，专门帮助用户分析血压数据。

重要规则：
1. 基于用户提供的血压数据给出分析
2. 提供健康建议和生活方式指导
3. 提醒可能的健康风险
4. 强调需要咨询专业医生的情况
5. 不要提供具体的医疗诊断或处方药
6. 对于紧急情况（如血压极高），明确建议立即就医
7. 用中文回答，语气温和、专业、简洁`;

    const userMessage = `用户血压记录：
${readingsContext}

用户问题：${question}

请根据以上血压数据回答用户的问题，给出专业的健康建议。`;

    // 4. 调用百度千帆的模型（例如ERNIE-Bot-turbo）
    const chatResponse = await fetch(
      `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/ernie-3.5-8k?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          temperature: 0.7
        })
      }
    );

    const chatData = await chatResponse.json();
    
    // 5. 提取回复内容
    const aiResponse = chatData.result || '抱歉，暂时无法生成回答，请稍后再试。';

    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    console.error('AI服务调用错误:', error);
    return NextResponse.json(
      { response: `抱歉，AI助手暂时无法连接。错误原因：${error.message || '网络或服务异常'}` },
      { status: 200 }
    );
  }
}