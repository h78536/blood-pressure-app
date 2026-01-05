import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 ========== AI API 调用开始 ==========');
  
  // 设置超时和错误处理
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

  try {
    const { question, readingsContext } = await request.json();
    console.log('📝 收到请求参数:', { question, readingsContextLength: readingsContext?.length });

    // 1. 读取环境变量
    const API_KEY = process.env.ZHIPU_API_KEY;
    console.log('🔑 环境变量 ZHIPU_API_KEY 长度:', API_KEY?.length || 0);
    console.log('🔑 密钥前10位:', API_KEY ? API_KEY.substring(0, 10) + '...' : '未找到');

    if (!API_KEY) {
      console.error('❌ 错误：API密钥未找到');
      console.log('🔍 所有包含ZHIPU的环境变量:', 
        Object.keys(process.env).filter(key => key.includes('ZHIPU')));
      return NextResponse.json(
        { response: 'AI服务配置有误，请在管理后台检查API密钥设置。' },
        { status: 500 }
      );
    }

    // 2. 构建专业的医疗助手提示词
    const systemPrompt = `你是一个专业、谨慎的医疗健康助手，专门帮助用户分析家庭血压监测数据。
请严格遵循以下准则：
1. 基于用户提供的血压记录进行分析。
2. 提供生活方式建议（如饮食、运动、作息）。
3. 提醒需要注意的健康风险信号。
4. 始终强调"您的数据仅供参考，具体诊断请咨询执业医师"。
5. 绝不提供具体的疾病诊断、治疗方案或药物建议。
6. 如遇收缩压 > 180 mmHg 或舒张压 > 120 mmHg 的情况，明确建议立即就医。
请使用温和、清晰、专业的中文进行回复。`;

    const userMessage = `用户的血压记录如下：
${readingsContext}

用户的问题是：${question}

请基于以上记录，对用户的问题进行解答。`;

    console.log('📡 正在调用智谱API...');
    console.log('🌐 请求URL:', 'https://open.bigmodel.cn/api/paas/v4/chat/completions');
    console.log('🤖 使用模型: glm-4');
    console.log('⏱️  开始时间:', new Date().toISOString());

    // 3. 调用智谱AI API
    const startTime = Date.now();
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.7,
        max_tokens: 800,
        stream: false,
      }),
      signal: controller.signal,
    });

    const endTime = Date.now();
    console.log('⏱️  请求耗时:', (endTime - startTime) + 'ms');
    clearTimeout(timeoutId);

    console.log('📊 响应状态码:', response.status);
    console.log('📊 响应状态文本:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API响应错误:', response.status);
      console.error('❌ 错误详情:', errorText);
      
      let errorMsg = `服务请求失败 (状态码: ${response.status})`;
      try {
        const errorData = JSON.parse(errorText);
        errorMsg = errorData.error?.message || errorMsg;
        console.error('❌ 解析后的错误:', errorData);
      } catch (e) {
        console.error('❌ 错误响应不是JSON格式');
      }
      
      // 根据错误类型返回不同提示
      if (response.status === 401) {
        console.error('❌ 认证失败：API密钥无效或已过期');
        return NextResponse.json(
          { response: 'API密钥无效或已过期，请检查密钥设置。' },
          { status: 200 }
        );
      }
      
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log('✅ API调用成功，收到响应');
    console.log('📦 响应数据结构:', Object.keys(data));
    console.log('💬 AI回复长度:', data.choices?.[0]?.message?.content?.length || 0);
    
    const aiResponse = data.choices?.[0]?.message?.content || 
      '您好，我已收到您的血压数据。由于数据解读需要专业医学背景，建议您将完整记录提供给医生进行详细分析。';

    console.log('✅ ========== AI API 调用成功结束 ==========');
    return NextResponse.json({ response: aiResponse });

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ ========== AI API 调用失败 ==========');
    console.error('❌ 错误名称:', error.name);
    console.error('❌ 错误消息:', error.message);
    console.error('❌ 错误堆栈:', error.stack);
    console.error('❌ 错误完整对象:', error);

    // 用户友好的错误提示
    let userMessage = 'AI助手暂时无法提供服务，请稍后重试。';
    if (error.name === 'AbortError') {
      console.error('❌ 错误类型：请求超时');
      userMessage = '请求超时，可能网络不畅，请检查网络连接。';
    } else if (error.message.includes('401') || error.message.includes('API') || error.message.includes('auth')) {
      console.error('❌ 错误类型：认证失败');
      userMessage = '服务认证失败，请确认API密钥有效且未过期。';
    } else if (error.message.includes('429')) {
      console.error('❌ 错误类型：频率限制');
      userMessage = '服务使用过于频繁，请稍候一分钟再试。';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      console.error('❌ 错误类型：网络问题');
      userMessage = '网络连接失败，请检查网络设置。';
    }

    console.error('❌ 返回给用户的错误信息:', userMessage);
    console.error('❌ ======================================');

    return NextResponse.json(
      { response: userMessage },
      { status: 200 }
    );
  }
}