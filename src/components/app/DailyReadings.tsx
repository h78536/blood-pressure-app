'use client';
import { useMemo, useState } from 'react';
import type { BloodPressureReading } from '@/lib/types';

const getCategory = (systolic: number, diastolic: number): { label: string, className: string } => {
  if (systolic < 90 || diastolic < 60) return { label: '低', className: 'bg-slate-500 text-white' };
  if (systolic < 120 && diastolic < 80) return { label: '理想', className: 'bg-green-500 text-white' };
  if (systolic < 130 && diastolic < 85) return { label: '正常', className: 'text-slate-700 border-slate-300' };
  return { label: '高', className: 'bg-red-500 text-white' };
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


const TimeOfDayCard = ({ title, icon, readings, deleteReading }: { title: string, icon: React.ReactNode, readings: BloodPressureReading[], deleteReading: (id: string) => void }) => {
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
    return null;
  }
  
  return (
    <div className="border rounded-lg shadow-sm bg-card flex-1">
      <div className="p-6 pb-2 flex-row items-center space-x-2">
        {icon}
        <h3 className="text-sm font-medium">{title}</h3>
      </div>
      <div className="p-6 pt-0">
        {readings.map(r => {
          const category = getCategory(r.systolic, r.diastolic);
          return (
            <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
              <div className="flex flex-col">
                <span className="font-medium text-sm">
                  {r.systolic} / {r.diastolic} <span className="text-xs text-muted-foreground">mmHg</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  脉搏: {r.pulse} bpm
                </span>
              </div>
              <div className="flex items-center gap-2">
                 <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${category.className}`}>{category.label}</span>
                <button onClick={() => handleDeleteClick(r.id)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 w-10 hover:bg-accent">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
       <DeleteConfirmationDialog open={dialogOpen} onOpenChange={setDialogOpen} onConfirm={handleConfirmDelete} />
    </div>
  );
};

type DailyReadingsProps = {
    readings: BloodPressureReading[];
    deleteReading: (id: string) => void;
};

export default function DailyReadings({ readings, deleteReading }: DailyReadingsProps) {
  const todayReadings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return readings.filter(r => {
      const readingDate = new Date(r.timestamp);
      return readingDate >= today && readingDate < tomorrow;
    });
  }, [readings]);
  
  const morningReadings = todayReadings.filter(r => new Date(r.timestamp).getHours() < 12);
  const afternoonReadings = todayReadings.filter(r => new Date(r.timestamp).getHours() >= 12 && new Date(r.timestamp).getHours() < 18);
  const eveningReadings = todayReadings.filter(r => new Date(r.timestamp).getHours() >= 18);

  if (todayReadings.length === 0) {
    return (
       <div className="border rounded-lg shadow-sm bg-card">
         <h2 className="text-2xl font-semibold p-6">今日记录</h2>
        <div className="p-6 pt-0">
          <p className="text-center text-muted-foreground py-8">今天还没有测量记录。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg shadow-sm bg-card">
        <h2 className="text-2xl font-semibold p-6">今日记录</h2>
      <div className="p-6 pt-0 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <TimeOfDayCard title="早晨" icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="M8 6c.6-1.5 1.8-2.6 3-3 .6.9 1 2.1 1 3.4 0 1.9-1.2 3.8-3 3.8-1.5 0-2.3-1.1-2.6-2.1Z"/><path d="m16 6-.3-1.1c-.2-.7-.6-1.3-1.1-1.8.5.8.9 1.8.9 2.9 0 1.9-1.2 3.8-3 3.8-.9 0-1.6-.4-2.1-1"/></svg>} readings={morningReadings} deleteReading={deleteReading} />
          <TimeOfDayCard title="午后" icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 6.34-1.41-1.41"/></svg>} readings={afternoonReadings} deleteReading={deleteReading} />
          <TimeOfDayCard title="夜晚" icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>} readings={eveningReadings} deleteReading={deleteReading} />
        </div>
      </div>
    </div>
  );
}