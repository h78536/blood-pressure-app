'use client';

import { useState, useRef, useEffect, startTransition } from 'react';
import { askMedicalQuestion } from '@/ai/flows/ask-medical-question';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const result = await askMedicalQuestion({
        question: input,
        history: messages,
      });
      const modelMessage: Message = { role: 'model', content: result };
      startTransition(() => {
        setMessages([...newMessages, modelMessage]);
      });
    } catch (e) {
      console.error(e);
      const errorMessage: Message = {
        role: 'model',
        content: '抱歉，AI顾问暂时无法回答，请稍后再试。',
      };
      startTransition(() => {
        setMessages([...newMessages, errorMessage]);
      });
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
    <div className="flex flex-col h-[45vh] w-full rounded-lg border bg-background">
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
