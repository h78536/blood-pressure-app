"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

const NOTIFICATION_TIME_KEY = 'notificationTime';
const NOTIFICATION_PERMISSION_KEY = 'notificationPermission';

const Dialog = ({ open, onOpenChange, title, description, children }: { open: boolean, onOpenChange: (open: boolean) => void, title: string, description: string, children: React.ReactNode }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80" onClick={() => onOpenChange(false)}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-white p-6 shadow-lg sm:rounded-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {children}
         <button onClick={() => onOpenChange(false)} className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
      </div>
    </div>
  );
};


export default function NotificationSettings() {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [reminderTime, setReminderTime] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // This runs only on the client
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
      const savedTime = localStorage.getItem(NOTIFICATION_TIME_KEY);
      if (savedTime) {
        setReminderTime(savedTime);
      }
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("您的浏览器不支持通知。");
      return;
    }
    try {
      const status = await Notification.requestPermission();
      setPermission(status);
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, status);
      if (status === 'granted') {
        alert("通知权限已开启。");
      } else {
        alert("通知权限被拒绝。");
      }
    } catch (err) {
       console.error("Error requesting notification permission:", err)
       alert("请求通知权限时出错。");
    }
  };

  const handleSave = () => {
    localStorage.setItem(NOTIFICATION_TIME_KEY, reminderTime);
    alert(`提醒时间设置为 ${reminderTime}`);
    setIsOpen(false);
  };
  
  return (
    <>
      <button onClick={() => setIsOpen(true)} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 w-10 hover:bg-slate-100">
         {permission === 'granted' && reminderTime ? 
            <Bell className="text-blue-600" />
            : 
            <BellOff />
          }
          <span className="sr-only">打开通知设置</span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen} title="测量提醒" description="设置每日提醒，以免忘记测量血压。">
          <div className="grid gap-4 py-4">
            {permission !== 'granted' ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <p>请允许我们向您发送通知。</p>
                <button onClick={handleRequestPermission} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">开启提醒</button>
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="reminder-time" className="text-sm font-medium leading-none text-right">
                  提醒时间
                </label>
                <input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm col-span-3"
                />
              </div>
            )}
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            {permission === 'granted' && <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700">保存设置</button>}
          </div>
      </Dialog>
    </>
  );
}