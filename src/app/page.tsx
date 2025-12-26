
'use client';

import { useState, useEffect } from 'react';
import { Home as HomeIcon, LineChart, List, FilePlus } from 'lucide-react';
import { useBloodPressureData } from '@/hooks/use-blood-pressure-data';
import Header from '@/components/app/Header';
import BloodPressureForm from '@/components/app/BloodPressureForm';
import DailyReadings from '@/components/app/DailyReadings';
import BloodPressureChart from '@/components/app/BloodPressureChart';
import ReadingsList from '@/components/app/ReadingsList';
import PasswordProtect from '@/components/app/PasswordProtect';

type Tab = 'record' | 'today' | 'chart' | 'history';

const TabButton = ({
  id,
  activeTab,
  setActiveTab,
  icon: Icon,
  label,
}: {
  id: Tab;
  activeTab: Tab;
  setActiveTab: (id: Tab) => void;
  icon: React.ElementType;
  label: string;
}) => (
  <button
    onClick={() => setActiveTab(id)}
    className={`flex flex-col items-center justify-center gap-1 w-full h-16 rounded-lg transition-colors ${
      activeTab === id ? 'bg-primary/20 text-primary' : 'text-muted-foreground'
    }`}
  >
    <Icon className="h-6 w-6" />
    <span className="text-xs font-medium">{label}</span>
  </button>
);


export default function HomePage() {
  const [readings, addReading, deleteReading] = useBloodPressureData();
  const [activeTab, setActiveTab] = useState<Tab>('record');
  
  const sortedReadingsForChart = [...readings].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return (
    <PasswordProtect>
      <div className="flex flex-col h-screen bg-background">
        <Header readings={readings} />
        <main className="flex-1 container mx-auto p-4 md:p-6 overflow-y-auto">
          {activeTab === 'record' && (
            <div className="max-w-md mx-auto">
              <BloodPressureForm addReading={addReading} />
            </div>
          )}
          {activeTab === 'today' && <DailyReadings readings={readings} deleteReading={deleteReading}/>}
          {activeTab === 'chart' && <BloodPressureChart readings={sortedReadingsForChart} />}
          {activeTab === 'history' && <ReadingsList readings={readings} deleteReading={deleteReading}/>}
        </main>

        <footer className="sticky bottom-0 bg-background border-t shadow-inner">
          <div className="container mx-auto p-2 grid grid-cols-4 gap-2">
            <TabButton id="record" activeTab={activeTab} setActiveTab={setActiveTab} icon={FilePlus} label="记录" />
            <TabButton id="today" activeTab={activeTab} setActiveTab={setActiveTab} icon={HomeIcon} label="今日" />
            <TabButton id="chart" activeTab={activeTab} setActiveTab={setActiveTab} icon={LineChart} label="图表" />
            <TabButton id="history" activeTab={activeTab} setActiveTab={setActiveTab} icon={List} label="历史" />
          </div>
        </footer>
      </div>
    </PasswordProtect>
  );
}
