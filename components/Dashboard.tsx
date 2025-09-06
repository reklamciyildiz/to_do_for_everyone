'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TaskBoard } from '@/components/TaskBoard';
import { TaskList } from '@/components/TaskList';
import { Analytics } from '@/components/Analytics';
import { Settings } from '@/components/Settings';
import { Header } from '@/components/Header';
import { Profile } from '@/components/Profile';

import { useView } from '@/components/ViewContext';

export function Dashboard() {
  const { currentView, setCurrentView } = useView();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'board':
        return <TaskBoard />;
      case 'list':
        return <TaskList />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <TaskBoard />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        currentView={currentView}
        onViewChange={setCurrentView}
        isOpen={sidebarOpen}
        onCloseSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}