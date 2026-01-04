"use client";

import AIChat from './AIChat';
import type { BloodPressureReading } from '@/lib/types';

type AISummaryProps = {
  readings: BloodPressureReading[];
};

export default function AISummary({ readings }: AISummaryProps) {
  // 趋势总结功能暂时禁用，因为它依赖于一个更复杂的设置。
  // 我们专注于修复核心的AI聊天功能。
  const isSummaryFeatureEnabled = false;

  return (
    <div className="p-0 space-y-6 h-full flex flex-col">
      {isSummaryFeatureEnabled && (
        <div>
          {/* 这里是未来可以恢复趋势总结功能的地方 */}
        </div>
      )}

      <div className="flex-1 min-h-0">
        {/* 确保这里传递 readings 属性 */}
        <AIChat readings={readings} />
      </div>
    </div>
  );
}