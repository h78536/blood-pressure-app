"use client";

import type { BloodPressureReading } from '@/lib/types';
import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';

type ReadingsListProps = {
  readings: BloodPressureReading[];
  deleteReading: (id: string) => void;
};


const getCategory = (systolic: number, diastolic: number): { label: string, className: string } => {
  if (systolic < 90 || diastolic < 60) return { label: '低血压', className: 'bg-slate-500 text-white' };
  if (systolic < 120 && diastolic < 80) return { label: '理想', className: 'bg-green-500 text-white' };
  if (systolic < 130 && diastolic < 85) return { label: '正常', className: 'text-slate-700 border-slate-300' };
  return { label: '高血压', className: 'bg-red-500 text-white' };
};

const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm }: { open: boolean, onOpenChange: (open: boolean) => void, onConfirm: () => void }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-card p-6 shadow-lg sm:rounded-lg">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">确认删除</h3>
          <p className="text-sm text-muted-foreground">您确定要删除这条测量记录吗？此操作无法撤销。</p>
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 border border-input bg-transparent hover:bg-accent" onClick={() => onOpenChange(false)}>取消</button>
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90" onClick={onConfirm}>删除</button>
        </div>
      </div>
    </div>
  );
};


export default function ReadingsList({ readings, deleteReading }: ReadingsListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setSelectedId(id);
    setDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedId) {
      deleteReading(selectedId);
    }
    setDialogOpen(false);
    setSelectedId(null);
  };

  if (readings.length === 0) {
    return (
      <div className="border rounded-lg shadow-sm bg-card">
        <div className="p-6">
          <h2 className="text-2xl font-semibold">全部历史记录</h2>
          <p className="text-center text-muted-foreground py-8">暂无历史记录，请在“记录”标签页添加您的第一条测量数据。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="border rounded-lg shadow-sm bg-card">
        <h2 className="text-2xl font-semibold p-6">全部历史记录</h2>
        <div className="p-0">
          <div className="w-full overflow-auto max-h-[500px]">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">日期</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">血压 (mmHg)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">脉搏 (bpm)</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">分类</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground text-right">操作</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {readings.map((r) => {
                  const category = getCategory(r.systolic, r.diastolic);
                  const date = new Date(r.timestamp);
                  return (
                    <tr key={r.id} className="border-b transition-colors hover:bg-muted/50">
                      <td className="p-4 align-middle">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{date.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs text-muted-foreground">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className="font-bold">{r.systolic}</span> / {r.diastolic}
                      </td>
                      <td className="p-4 align-middle">{r.pulse}</td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${category.className}`}>{category.label}</span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button onClick={() => handleDeleteClick(r.id)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 w-10 hover:bg-accent">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">删除</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <DeleteConfirmationDialog open={dialogOpen} onOpenChange={setDialogOpen} onConfirm={handleConfirmDelete} />
      </div>
    </div>
  );
}