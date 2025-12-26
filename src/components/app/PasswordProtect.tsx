'use client';

import { useState, useEffect } from 'react';

// 您可以在这里修改为您想要的任何密码
const CORRECT_PASSWORD = '123'; 
const STORAGE_KEY = 'app_authenticated';

export default function PasswordProtect({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 在客户端加载时检查会话存储
  useEffect(() => {
    const sessionAuth = sessionStorage.getItem(STORAGE_KEY);
    if (sessionAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('密码错误，请重试。');
      setPassword('');
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="w-full max-w-sm mx-auto p-8 border rounded-lg shadow-sm bg-card">
        <div className="space-y-4">
            <div className="space-y-2 text-center">
                 <h1 className="text-2xl font-semibold">请输入访问密码</h1>
                 <p className="text-muted-foreground text-sm">此应用受密码保护</p>
            </div>
          
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="在此输入密码"
                required
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              />
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              进入
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
