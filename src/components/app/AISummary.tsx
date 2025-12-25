"use client";

import { useState, startTransition } from 'react';
import type { BloodPressureReading } from '@/lib/types';
import { summarizeBloodPressureTrends } from '@/ai/flows/summarize-blood-pressure-trends';
import AIChat from './AIChat';

type AISummaryProps = {
  readings: BloodPressureReading[];
};

type Period = 'weekly' | 'monthly' | 'all-time';

export default function AISummary({ readings }: AISummaryProps) {
  const [activePeriod, setActivePeriod] = useState<Period>('weekly');
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');


  const handleSummarize = async (period: Period) => {
    setActivePeriod(period);
    
    if (readings.length < 3) {
      setSummary('');
      setError('需要至少3条测量记录才能进行AI分析。');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSummary('');

    const now = new Date();
    const filteredReadings = readings.filter(r => {
        const readingDate = new Date(r.timestamp);
        if (period === 'weekly') {
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return readingDate >= oneWeekAgo;
        }
        if (period === 'monthly') {
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return readingDate >= oneMonthAgo;
        }
        return true; // all-time
    });

    if (filteredReadings.length < 3 && period !== 'all-time') {
      setIsLoading(false);
      setError(`过去${{weekly: '一周', monthly: '一个月', 'all-time': '全部时间'}[period]}内的记录不足3条，无法生成分析。`);
      return;
    }

    try {
      const result = await summarizeBloodPressureTrends({ readings: filteredReadings, period });
      startTransition(() => {
        setSummary(result);
      });
    } catch (e) {
      console.error(e);
      setError('抱歉，AI分析服务暂时出现问题，请稍后再试。');
    } finally {
      setIsLoading(false);
    }
  };

  const PeriodButton = ({ period, label }: { period: Period, label: string }) => (
    <button
      key={period}
      onClick={() => handleSummarize(period)}
      disabled={isLoading}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 flex-1 border disabled:pointer-events-none disabled:opacity-50
        ${activePeriod === period && !isLoading ? 'bg-primary/20 text-primary-foreground border-primary/50' : 'bg-transparent'}`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-0 space-y-6">
      <div>
        <h4 className="text-base font-semibold mb-2 text-foreground">趋势总结</h4>
        <div className="flex justify-between gap-2 mb-4">
          <PeriodButton period="weekly" label="本周" />
          <PeriodButton period="monthly" label="本月" />
          <PeriodButton period="all-time" label="全部" />
        </div>
        <div className="min-h-[120px] rounded-lg border border-input bg-background p-4 text-sm flex items-center justify-center">
          {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>AI正在分析中...</span>
              </div>
          )}
          {error && <p className="text-destructive text-center">{error}</p>}
          {summary && <p className="text-foreground leading-relaxed">{summary}</p>}
          {!isLoading && !error && !summary && <p className="text-muted-foreground text-center">请选择一个时间范围以生成AI总结。</p>}
        </div>
      </div>

      <div className="border-t pt-6">
        <h4 className="text-base font-semibold mb-4 text-foreground">AI健康顾问</h4>
        <AIChat />
      </div>
    </div>
  );
}
