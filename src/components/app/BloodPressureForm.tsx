"use client";

import React from 'react';
import type { BloodPressureReading } from "@/lib/types";

type BloodPressureFormProps = {
  addReading: (reading: Omit<BloodPressureReading, 'id' | 'timestamp'>) => void;
};

export default function BloodPressureForm({ addReading }: BloodPressureFormProps) {
  
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      systolic: Number(formData.get('systolic')),
      diastolic: Number(formData.get('diastolic')),
      pulse: Number(formData.get('pulse')),
    };
    
    if(values.systolic && values.diastolic && values.pulse){
       addReading(values);
       (event.target as HTMLFormElement).reset();
    }
  }

  return (
    <div className="border rounded-lg shadow-sm bg-card">
      <div className="p-6">
        <h2 className="text-2xl font-semibold leading-none tracking-tight">记录新测量</h2>
        <p className="text-sm text-muted-foreground mt-1.5">输入您的收缩压、舒张压和脉搏。</p>
      </div>
      <div className="p-6 pt-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="systolic" className="text-sm font-medium leading-none">收缩压 (mmHg)</label>
                <input id="systolic" name="systolic" type="number" placeholder="例如 120" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
              <div className="space-y-2">
                <label htmlFor="diastolic" className="text-sm font-medium leading-none">舒张压 (mmHg)</label>
                <input id="diastolic" name="diastolic" type="number" placeholder="例如 80" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
            </div>
             <div className="space-y-2">
                <label htmlFor="pulse" className="text-sm font-medium leading-none">脉搏 (bpm)</label>
                <input id="pulse" name="pulse" type="number" placeholder="例如 70" required className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" />
              </div>
            <button type="submit" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
              保存记录
            </button>
          </form>
      </div>
    </div>
  );
}