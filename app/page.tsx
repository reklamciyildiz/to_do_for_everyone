'use client';

import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { TaskProvider } from '@/components/TaskContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="todo-theme">
      <TaskProvider>
        <div className="min-h-screen bg-background">
          <Dashboard />
          <Toaster />
        </div>
      </TaskProvider>
    </ThemeProvider>
  );
}