import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    const { question, readingsContext } = await request.json();
    
    // 检查API密钥
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API密钥未设置');
      return NextResponse.json(
        { response: 'AI服务未配置，请检查环境变量设置。' },
        { status: 500 }
      );
    }
    
    // 构建系统提示词
    const systemPrompt = `你是一个专业、细心的医疗健康助手，专门帮助用户分析血压数据。

重要规则：
1. 基于用户提供的血压数据给出分析
2. 提供健康建议和生活方式指导
3. 提醒可能的健康风险
4. 强调需要咨询专业医生的情况
5. 不要提供具体的医疗诊断或处方药
6. 对于紧急情况（如血压极高），明确建议立即就医
7. 用中文回答，语气温和、专业、简洁`;

    // 构建用户消息
    const userMessage = `用户血压记录：
${readingsContext}

用户问题：${question}

请根据以上血压数据回答用户的问题，给出专业的健康建议。`;

    console.log('调用OpenAI API，问题长度:', question.length);
    
    // 调用OpenAI API（使用gpt-3.5-turbo以节省费用）
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const aiResponse = completion.choices[0]?.message?.content || 
      '抱歉，暂时无法生成回答。请稍后再试。';
    
    console.log('OpenAI响应成功');
    
    return NextResponse.json({ response: aiResponse });
    
  } catch (error: any) {
    console.error('OpenAI API调用错误:', error);
    
    // 用户友好的错误消息
    let errorMessage = 'AI服务暂时不可用，请稍后再试。';
    
    if (error.message?.includes('API key') || error.message?.includes('api_key')) {
      errorMessage = 'API密钥配置错误。请确认：\n1. 密钥是否正确\n2. 是否已设置环境变量\n3. 密钥是否已激活';
    } else if (error.message?.includes('rate limit')) {
      errorMessage = '请求过于频繁，请稍后再试（每分钟限制3次）。';
    } else if (error.message?.includes('insufficient_quota')) {
      errorMessage = 'API额度已用完。请登录OpenAI平台检查余额。';
    } else if (error.message?.includes('invalid_api_key')) {
      errorMessage = 'API密钥无效。请检查密钥格式是否正确。';
    }
    
    return NextResponse.json(
      { response: `抱歉，${errorMessage}` },
      { status: 200 }
    );
  }
}