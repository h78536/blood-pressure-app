'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import type { BloodPressureReading } from '@/lib/types';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AIChat({ readings = [] }: { readings?: BloodPressureReading[] }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: '您好！我是您的血压健康助手。我可以帮您分析血压数据、提供健康建议。请问有什么可以帮您的吗？'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    
    // 准备血压数据上下文
    const readingsContext = readings.length > 0
      ? '用户的血压记录如下：\n' + readings.slice(-20).map(r => 
          `- ${new Date(r.timestamp).toLocaleString('zh-CN')}: 收缩压 ${r.systolic} / 舒张压 ${r.diastolic} mmHg, 脉搏 ${r.pulse} bpm`
        ).join('\n')
      : '用户暂无血压记录。';
    
    const question = input;

    setInput('');
    setIsLoading(true);

    try {
      // 调用OpenAI API
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

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败 (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const modelResponse = data.response || '抱歉，暂时无法生成回答。';
      
      const modelMessage: Message = { role: 'model', content: modelResponse };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error: any) {
      console.error('AI请求错误:', error);
      
      // 用户友好的错误消息
      let errorMessage = '抱歉，AI助手暂时无法回答。请检查网络连接或稍后再试。';
      
      if (error.message?.includes('API密钥') || error.message?.includes('未配置')) {
        errorMessage = 'AI服务配置异常，请检查API密钥设置。';
      } else if (error.message?.includes('额度') || error.message?.includes('quota')) {
        errorMessage = 'API额度可能已用完，请检查OpenAI账户余额。';
      } else if (error.message?.includes('429') || error.message?.includes('rate limit')) {
        errorMessage = '请求过于频繁，请稍等一分钟再试。';
      }
      
      const errorMessageObj: Message = { 
        role: 'model', 
        content: `${errorMessage}\n\n错误详情: ${error.message || '未知错误'}`
      };
      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
      handleSend();
    }
  };

  // 示例问题建议
  const exampleQuestions = [
    '我的血压算高吗？',
    '正常血压范围是多少？',
    '如何降低血压？',
    '分析一下我的血压趋势',
    '血压多少需要看医生？'
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
              <p className="whitespace-pre-wrap break-words">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-lg px-4 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-0"></span>
              <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150"></span>
              <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-300"></span>
              <span className="ml-2 text-xs">AI正在思考...</span>
            </div>
          </div>
        )}
        
        {messages.length === 1 && !isLoading && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">您可以问我：</p>
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
                  className="text-xs px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
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
            placeholder="输入您的问题，例如：我的血压正常吗？"
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={isLoading || input.trim() === ''}
            className={`absolute right-1 top-1/2 -translate-y-1/2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 transition-colors ${
              isLoading || input.trim() === ''
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-accent bg-primary text-primary-foreground'
            }`}
            aria-label="发送消息"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          AI助手基于OpenAI GPT提供健康建议，仅供参考，请咨询专业医生
        </p>
      </div>
    </div>
  );
}