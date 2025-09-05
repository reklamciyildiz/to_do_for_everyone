'use client';

import { Menu, Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserMenu } from '@/components/UserMenu';
import { NotificationPanel } from '@/components/NotificationPanel';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { useState } from 'react';

interface HeaderProps {
  onSidebarToggle: () => void;
}

export function Header({ onSidebarToggle }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Mobile sidebar toggle */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden"
          onClick={onSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks, teams, or members..."
              className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus-visible:ring-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Create task button */}
          <Button 
            size="sm" 
            onClick={() => setShowCreateTask(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium hidden sm:flex"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
          
          {/* Mobile create task button */}
          <Button 
            size="sm" 
            onClick={() => setShowCreateTask(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium sm:hidden p-2"
          >
            <Plus className="h-4 w-4" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User menu */}
          <UserMenu />
        </div>
      </div>

      {/* Notifications panel */}
      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Create task modal */}
      <CreateTaskModal 
        open={showCreateTask} 
        onClose={() => setShowCreateTask(false)} 
      />
    </header>
  );
}