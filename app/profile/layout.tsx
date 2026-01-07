'use client';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { ViewType } from '@/components/ViewContext';
import { useState } from 'react';

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('settings');

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={isSidebarOpen}
        onCloseSidebar={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 overflow-y-auto">
        <Header 
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
