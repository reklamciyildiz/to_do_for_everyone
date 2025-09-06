'use client';

import { TaskProvider } from '@/components/TaskContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ViewProvider } from '@/components/ViewContext';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="todo-theme">
      <TaskProvider>
        <ViewProvider>
          {children}
          <Toaster />
        </ViewProvider>
      </TaskProvider>
    </ThemeProvider>
  );
}
