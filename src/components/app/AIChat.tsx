'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Clock, Brain } from 'lucide-react';
import type { BloodPressureReading } from '@/lib/types';

type Message = {
  role: 'user' | 'model';
  content: string;
};

// 数据格式化函数
function formatReadingsForAI(readings: BloodPressureReading[]): string {
  if (!readings || readings.length === 0) {
    return '【当前无血压记录数据】';
  }

  // 按时间排序
  const sortedReadings = [...readings].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // 格式化每条记录
  const formattedLines = sortedReadings.slice(0, 15).map((reading) => {
    const date = new Date(reading.timestamp).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${date}: ${reading.systolic}/${reading.diastolic} mmHg (脉搏: ${reading.pulse})`;
  });

  // 添加统计
  const validReadings = sortedReadings.filter(r => r.systolic && r.diastolic);
  let summary = '';
  
  if (validReadings.length > 0) {
    const avgSystolic = Math.round(validReadings.reduce((sum, r) => sum + r.systolic, 0) / validReadings.length);
    const avgDiastolic = Math.round(validReadings.reduce((sum, r) => sum + r.diastolic, 0) / validReadings.length);
    
    summary = `\n【统计】平均: ${avgSystolic}/${avgDiastolic} mmHg，共 ${readings.length} 次测量`;
  }

  return `【血压记录】\n${formattedLines.join('\n')}${summary}`;
}

export default function AIChat({ readings = [] }: { readings?: BloodPressureReading[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '您好！我是您的血压健康助手，基于智谱AI为您服务。\n\n由于使用国内AI模型，响应可能需要15-30秒，请您耐心等待。\n\n我可以帮您分析血压数据、提供健康建议。请问有什么可以帮您的吗？'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestTime, setRequestTime] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    
    // 使用优化的数据格式化
    const readingsContext = formatReadingsForAI(readings);
    const question = input;

    setInput('');
    setIsLoading(true);
    const startTime = Date.now();
    setRequestTime(startTime);

    try {
      // 调用智谱AI API
      const response = await fetch('/api/ai/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          readingsContext
        }),
      });

      const endTime = Date.now();
      const duration = Math.round((endTime - startTime) / 1000);
      console.log(`AI响应时间: ${duration}秒`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      let modelResponse = data.response || '抱歉，暂时无法生成回答。';
      
      // 添加响应时间信息
      if (duration > 10) {
        modelResponse += `\n\n⏱️ 本次分析耗时约 ${duration} 秒`;
      }
      
      const modelMessage: Message = { role: 'model', content: modelResponse };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('AI请求错误:', error);
      
      // 优化的错误消息
      let errorMessage = '抱歉，智谱AI助手暂时无法回答。';
      
      if (error.message?.includes('API密钥') || error.message?.includes('未配置')) {
        errorMessage = 'AI服务配置异常，请检查API密钥设置。';
      } else if (error.message?.includes('额度') || error.message?.includes('quota')) {
        errorMessage = 'API额度可能已用完，请检查账户设置。';
      } else if (error.message?.includes('429')) {
        errorMessage = '请求过于频繁，智谱API有限制，请稍等一分钟再试。';
      } else if (error.message?.includes('超时') || error.message?.includes('AbortError')) {
        errorMessage = '智谱AI响应较慢，请求已超时。请简化问题或稍后重试。';
      } else if (error.message?.includes('网络')) {
        errorMessage = '网络连接问题，请检查您的网络设置。';
      }
      
      const errorMessageObj: Message = { 
        role: 'model', 
        content: `${errorMessage}\n\n💡 提示：智谱AI是国内服务，有时响应较慢，请耐心等待。`
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      setRequestTime(null);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      handleSend();
    }
  };

  // 优化的示例问题
  const exampleQuestions = [
    '我的血压正常吗？',
    '最近血压有升高趋势吗？',
    '如何通过饮食控制血压？',
    '帮我总结血压情况',
    '需要去医院检查吗？'
  ];

  return (
    <div className="flex flex-col h-full w-full rounded-lg border bg-background">
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg px-4 py-2 text-sm ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {msg.role === 'model' && <Brain className="h-3 w-3" />}
                <span className="text-xs font-medium">
                  {msg.role === 'user' ? '您' : '血压助手'}
                </span>
              </div>
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-4 py-3 text-sm bg-muted text-muted-foreground">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-300"></span>
                </div>
                <span className="font-medium">智谱AI正在分析</span>
                <Clock className="h-3 w-3 ml-auto" />
              </div>
              <p className="text-xs text-muted-foreground">
                • 正在处理您的 {readings.length} 条血压记录
                <br />
                • 通常需要15-30秒，请耐心等待
                <br />
                • 您的问题："{input.length > 30 ? input.substring(0, 30) + '...' : input}"
              </p>
            </div>
          </div>
        )}
        
        {messages.length === 1 && !isLoading && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              快速提问建议
            </p>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInput(q);
                    setTimeout(() => {
                      inputRef.current?.focus();
                    }, 0);
                  }}
                  className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t bg-background">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入关于血压的问题..."
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className={`absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 transition-colors ${
              isLoading || input.trim() === ''
                ? 'opacity-50 cursor-not-allowed bg-muted'
                : 'hover:bg-primary/90 bg-primary text-primary-foreground'
            }`}
            aria-label="发送消息"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {readings.length > 0 ? (
              <>基于 {readings.length} 条记录分析 • </>
            ) : null}
            使用智谱GLM AI • 响应可能较慢
          </p>
          {requestTime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              等待中...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}