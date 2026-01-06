import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 AI API 调用开始');
  
  // 设置超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    // 解析请求数据
    const { question, readingsContext } = await request.json();
    console.log('📝 收到问题:', question?.substring(0, 50) + (question?.length > 50 ? '...' : ''));
    console.log('📊 数据长度:', readingsContext?.length || 0);

    // 读取API密钥
    const API_KEY = process.env.ZHIPU_API_KEY;
    
    if (!API_KEY) {
      console.error('❌ API密钥未找到');
      return NextResponse.json(
        { response: 'AI服务配置有误，请检查API密钥设置。' },
        { status: 500 }
      );
    }

    console.log('🔑 密钥验证通过，长度:', API_KEY.length);

    // 构建用户消息（没有system prompt限制）
    const userMessage = `请帮我分析血压数据：\n\n血压记录：\n${readingsContext}\n\n问题：${question}\n\n请提供详细分析和建议。`;

    console.log('📡 正在调用智谱API...');
    const startTime = Date.now();
    
    // 调用智谱AI API
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4', // 使用智谱GLM-4模型
        messages: [
          { 
            role: 'user', 
            content: userMessage 
          }
        ],
        temperature: 0.8, // 较高温度，回答更多样
        max_tokens: 1200, // 足够长的回复
        top_p: 0.9,
        stream: false,
      }),
      signal: controller.signal,
    });

    const requestTime = Date.now() - startTime;
    console.log('⏱️  API请求耗时:', requestTime + 'ms');
    clearTimeout(timeoutId);

    console.log('📊 HTTP状态码:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API返回错误:', errorText);
      
      // 尝试解析错误信息
      let errorMessage = 'AI服务暂时不可用';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error?.message || errorMessage;
      } catch (e) {
        // 不是JSON格式，使用原始文本
        if (errorText.includes('quota') || errorText.includes('limit')) {
          errorMessage = 'API调用额度已用完';
        } else if (errorText.includes('invalid') || errorText.includes('auth')) {
          errorMessage = 'API密钥无效';
        }
      }

      return NextResponse.json(
        { response: errorMessage },
        { status: 200 }
      );
    }

    // 解析成功响应
    const data = await response.json();
    console.log('✅ API调用成功');
    
    const aiResponse = data.choices?.[0]?.message?.content || 
      '已收到您的血压数据，但未能生成分析结果。';
    
    console.log('💬 AI回复长度:', aiResponse.length, '字符');
    console.log('✨ 回复预览:', aiResponse.substring(0, 100) + (aiResponse.length > 100 ? '...' : ''));

    return NextResponse.json({ 
      response: aiResponse 
    });

  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error('❌ 请求过程出错:');
    console.error('   错误名称:', error.name);
    console.error('   错误信息:', error.message);
    
    let userMessage = 'AI服务暂时无法访问';
    
    if (error.name === 'AbortError') {
      userMessage = '请求超时，请检查网络连接或稍后重试。';
      console.error('   错误类型: 请求超时');
    } else if (error.message.includes('fetch') || error.message.includes('network')) {
      userMessage = '网络连接失败，请检查网络设置。';
      console.error('   错误类型: 网络错误');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      userMessage = '无法连接到AI服务，可能需要VPN。';
      console.error('   错误类型: 连接被拒');
    }

    return NextResponse.json(
      { response: userMessage },
      { status: 200 }
    );
  } finally {
    console.log('🏁 AI API 调用结束\n');
  }
}