"use client";

import React from 'react';
import type { BloodPressureReading } from '@/lib/types';

type BloodPressureChartProps = {
  readings: BloodPressureReading[];
};

const SVG_WIDTH = 500;
const SVG_HEIGHT = 300;
const PADDING = { top: 20, right: 30, bottom: 40, left: 40 };
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

const getCategoryColor = (systolic: number, diastolic: number): string => {
  if (systolic < 90 || diastolic < 60) return 'hsl(220 13% 47%)'; // slate-500 (low)
  if (systolic < 120 && diastolic < 80) return 'hsl(142 71% 45%)'; // green-500 (ideal)
  if (systolic < 130 && diastolic < 85) return 'hsl(24 95% 53%)'; // orange-500 (normal)
  if (systolic < 140 || diastolic < 90) return 'hsl(0 84% 60%)'; // red-500 (high-normal)
  return 'hsl(0 72% 51%)'; // red-600 (hypertension)
};


export default function BloodPressureChart({ readings }: BloodPressureChartProps) {
  if (readings.length < 2) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center rounded-lg bg-muted text-muted-foreground">
        需要至少两次测量才能生成图表。
      </div>
    );
  }

  const sortedReadings = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const allValues = sortedReadings.flatMap(r => [r.systolic, r.diastolic]);
  const yMin = Math.min(...allValues) - 10;
  const yMax = Math.max(...allValues) + 10;

  const xValueRange = sortedReadings.length - 1;
  const yValueRange = yMax - yMin;

  const toSvgX = (index: number) => PADDING.left + (index / xValueRange) * CHART_WIDTH;
  const toSvgY = (value: number) => PADDING.top + CHART_HEIGHT - ((value - yMin) / yValueRange) * CHART_HEIGHT;

  const generatePath = (dataKey: 'systolic' | 'diastolic'): string => {
    return sortedReadings
      .map((reading, index) => {
        const x = toSvgX(index);
        const y = toSvgY(reading[dataKey]);
        return `${index === 0 ? 'M' : 'L'} ${x},${y}`;
      })
      .join(' ');
  };
  
  const generateAreaPath = (dataKey: 'systolic' | 'diastolic'): string => {
    const linePath = generatePath(dataKey);
    const firstX = toSvgX(0);
    const lastX = toSvgX(sortedReadings.length - 1);
    const yBaseline = PADDING.top + CHART_HEIGHT;
    return `${linePath} L ${lastX},${yBaseline} L ${firstX},${yBaseline} Z`;
  };

  const systolicPath = generatePath('systolic');
  const diastolicPath = generatePath('diastolic');
  const systolicAreaPath = generateAreaPath('systolic');
  const diastolicAreaPath = generateAreaPath('diastolic');
  
  const yAxisLabels = () => {
      const labels = [];
      const steps = 5;
      const stepValue = Math.ceil(yValueRange / steps);
       for (let i = 0; i <= steps; i++) {
            const value = Math.round(yMin + i * stepValue);
            if (value <= yMax) {
                 labels.push({
                    value: value,
                    y: toSvgY(value)
                });
            }
       }
       return labels;
  }

  const xAxisLabels = () => {
    if (sortedReadings.length <= 1) return [];
    
    const labels = [
        {
            label: new Date(sortedReadings[0].timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit'}),
            x: toSvgX(0)
        },
         {
            label: new Date(sortedReadings[sortedReadings.length - 1].timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit'}),
            x: toSvgX(sortedReadings.length - 1)
        }
    ];

    if (sortedReadings.length > 5) {
      const midIndex = Math.floor(sortedReadings.length / 2);
      labels.splice(1, 0, {
        label: new Date(sortedReadings[midIndex].timestamp).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit'}),
        x: toSvgX(midIndex)
      });
    }
    
    return labels;
  }


  return (
    <div className="w-full h-[300px] md:h-[400px] flex justify-center items-center">
      <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-full">
        <defs>
          <linearGradient id="systolicGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="diastolicGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Y-Axis Grid Lines and Labels */}
        {yAxisLabels().map(({value, y}) => (
             <g key={`y-axis-${value}`}>
                 <line
                    x1={PADDING.left}
                    y1={y}
                    x2={PADDING.left + CHART_WIDTH}
                    y2={y}
                    stroke="hsl(var(--border))"
                    strokeDasharray="2"
                 />
                 <text
                    x={PADDING.left - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="10"
                    fill="hsl(var(--muted-foreground))"
                 >
                    {value}
                 </text>
             </g>
        ))}
         <text
            x={PADDING.left - 25}
            y={PADDING.top + CHART_HEIGHT / 2}
            textAnchor="middle"
            fontSize="10"
            fill="hsl(var(--muted-foreground))"
            transform={`rotate(-90, ${PADDING.left - 25}, ${PADDING.top + CHART_HEIGHT / 2})`}
        >
            mmHg
        </text>

        {/* X-Axis Labels */}
        {xAxisLabels().map(({label, x}) => (
             <text
                key={`x-axis-${label}`}
                x={x}
                y={SVG_HEIGHT - PADDING.bottom + 15}
                textAnchor="middle"
                fontSize="10"
                fill="hsl(var(--muted-foreground))"
             >
                {label}
             </text>
        ))}

        {/* Area Fills */}
        <path d={systolicAreaPath} fill="url(#systolicGradient)" />
        <path d={diastolicAreaPath} fill="url(#diastolicGradient)" />


        {/* Systolic Path */}
        <path d={systolicPath} stroke="hsl(var(--primary))" fill="none" strokeWidth="2" />

        {/* Diastolic Path */}
        <path d={diastolicPath} stroke="#10b981" fill="none" strokeWidth="2" />

        {/* Data Points */}
        {sortedReadings.map((reading, index) => {
             const categoryColor = getCategoryColor(reading.systolic, reading.diastolic);
             return (
              <g key={`point-${reading.id}`}>
                 <circle cx={toSvgX(index)} cy={toSvgY(reading.systolic)} r="3" fill={categoryColor} stroke="hsl(var(--card))" strokeWidth="1.5" />
                 <circle cx={toSvgX(index)} cy={toSvgY(reading.diastolic)} r="3" fill={categoryColor} stroke="hsl(var(--card))" strokeWidth="1.5" />
              </g>
             )
        })}

        {/* Legend */}
        <g transform={`translate(${PADDING.left + 20}, 0)`}>
            <circle cx="0" cy="10" r="4" fill="hsl(var(--primary))" />
            <text x="10" y="14" fontSize="12" fill="hsl(var(--foreground))">收缩压</text>
        </g>
         <g transform={`translate(${PADDING.left + 90}, 0)`}>
            <circle cx="0" cy="10" r="4" fill="#10b981" />
            <text x="10" y="14" fontSize="12" fill="hsl(var(--foreground))">舒张压</text>
        </g>
      </svg>
    </div>
  );
}