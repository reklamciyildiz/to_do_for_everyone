'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  List, 
  BarChart3, 
  Settings, 
  Users, 
  UserPlus,
  Calendar,
  Tag,
  Archive
} from 'lucide-react';
import { useTaskContext } from '@/components/TaskContext';
import { ViewType } from '@/components/ViewContext';

interface MenuItem {
  id: ViewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isOpen: boolean;
  onCloseSidebar: () => void;
}

export function Sidebar({ currentView, onViewChange, isOpen, onCloseSidebar }: SidebarProps) {
  const { tasks, currentTeam, teams, setCurrentTeam } = useTaskContext();

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    progress: tasks.filter(t => t.status === 'progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  const menuItems: MenuItem[] = [
    { id: 'board', label: 'Task Board', icon: LayoutDashboard, count: tasks.length },
    { id: 'list', label: 'List View', icon: List, count: tasks.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out z-50",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">TaskFlow</h1>
            </div>
          </div>

          {/* Team info */}
          {currentTeam && (
            <div className="px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-sm">{currentTeam.name}</h2>
                  <p className="text-xs text-muted-foreground">
                    {currentTeam.members.filter(m => m.isOnline).length} online • {currentTeam.members.length} total
                  </p>
                </div>
              </div>
              
              {/* Team Switcher */}
              {teams.length > 1 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground mb-2">SWITCH TEAM</p>
                  {teams.filter(team => team.id !== currentTeam.id).map((team) => (
                    <Button
                      key={team.id}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8 px-2 text-xs"
                      onClick={() => setCurrentTeam(team.id)}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded flex items-center justify-center">
                        <Users className="h-3 w-3 text-primary" />
                      </div>
                      <span>{team.name}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 h-11 px-3",
                  currentView === item.id && "bg-secondary text-secondary-foreground font-medium"
                )}
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count !== undefined && (
                  <Badge variant="secondary" className="h-5 px-2 text-xs">
                    {item.count}
                  </Badge>
                )}
              </Button>
            ))}

            {/* Quick filters */}
            <div className="pt-4">
              <p className="text-xs font-medium text-muted-foreground mb-3 px-3">QUICK FILTERS</p>
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start gap-3 h-9 px-3 text-sm">
                  <Calendar className="h-4 w-4" />
                  Due Today
                  <Badge variant="destructive" className="h-5 px-2 text-xs ml-auto">
                    2
                  </Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-9 px-3 text-sm">
                  <Tag className="h-4 w-4" />
                  High Priority
                  <Badge variant="outline" className="h-5 px-2 text-xs ml-auto">
                    {tasks.filter(t => t.priority === 'high').length}
                  </Badge>
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 h-9 px-3 text-sm">
                  <Archive className="h-4 w-4" />
                  Assigned to Me
                  <Badge variant="outline" className="h-5 px-2 text-xs ml-auto">
                    {tasks.filter(t => t.assigneeId === 'user-1').length}
                  </Badge>
                </Button>
              </div>
            </div>
          </nav>

          {/* Status summary */}
          <div className="p-4 border-t bg-muted/30">
            <p className="text-xs font-medium text-muted-foreground mb-3">TASK STATUS</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">To Do</span>
                <span className="font-medium">{taskCounts.todo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">{taskCounts.progress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Review</span>
                <span className="font-medium">{taskCounts.review}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Done</span>
                <span className="font-medium text-green-600">{taskCounts.done}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}