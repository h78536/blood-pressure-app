"use client";

import { useState } from 'react';
import type { BloodPressureReading } from '@/lib/types';
import AISummary from './AISummary';
import { Sparkles } from 'lucide-react';

const Dialog = ({ open, onOpenChange, title, children }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, children: React.ReactNode }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60" onClick={() => onOpenChange(false)}>
      <div className="fixed left-4 right-4 top-16 z-50 mx-auto grid w-auto max-w-lg gap-4 border bg-card p-6 shadow-lg sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col space-y-1.5 text-left">
          <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>
        </div>
        {children}
         <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
      </div>
    </div>
  );
};

export default function Header({ readings }: { readings: BloodPressureReading[] }) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <header className="bg-primary/20 shadow-sm sticky top-0 z-20">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l.7-1 2.1 4.4L15 12h5.78"/></svg>
          <h1 className="text-xl md:text-2xl font-bold text-foreground">
            血压追踪器
          </h1>
        </div>
        <div>
          <button 
            onClick={() => setIsAiOpen(true)} 
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold h-10 px-4 py-2 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            <span>AI 助手</span>
          </button>
        </div>
      </div>
       <Dialog open={isAiOpen} onOpenChange={setIsAiOpen} title="AI 助手">
        <div className="p-0 pt-4 max-h-[70vh] overflow-y-auto">
            <AISummary readings={readings} />
        </div>
       </Dialog>
    </header>
  );
}
