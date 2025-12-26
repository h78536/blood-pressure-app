'use client';

import { useState, useRef, useEffect } from 'react';
import { askMedicalQuestion } from '@/app/actions';
import { Send } from 'lucide-react';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if(!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);
  
  useEffect(() => {
    const handleFocus = () => {
      setTimeout(() => {
        // 当键盘弹出时，我们希望包含输入框的整个弹窗都向上滚动
        // 这个滚动应该由父级容器处理，但我们可以触发一个滚动事件
        inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
      }, 300); // 延迟以等待键盘弹出动画
    };

    const inputElement = inputRef.current;
    inputElement?.addEventListener('focus', handleFocus);

    return () => {
      inputElement?.removeEventListener('focus', handleFocus);
    };
  }, []);


  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const modelResponse = await askMedicalQuestion(currentInput);
      const modelMessage: Message = { role: 'model', content: modelResponse };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (e: any) {
      console.error('Server Action Error:', e);
      // 这个错误现在更具体了，因为服务器端会返回详细信息
      const errorMessageContent = `抱歉，AI顾问暂时无法回答。\n\n错误详情: ${e.message}.`;
      const errorMessage: Message = { role: 'model', content: errorMessageContent };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full w-full rounded-lg border bg-background">
      <div className="flex items-center justify-between p-2 border-b">
         <h4 className="text-base font-semibold text-foreground ml-2">AI健康顾问</h4>
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-center text-muted-foreground">
              对您的血压数据有疑问吗？<br/>可以问我，例如：“我的血压算高吗？”
            </p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="max-w-[80%] rounded-lg px-4 py-2 text-sm bg-muted text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-foreground rounded-full animate-pulse delay-300"></span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="在此输入您的问题..."
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm pr-12"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-8 w-8 hover:bg-accent disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
