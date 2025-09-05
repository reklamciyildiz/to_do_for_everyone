'use client';

import { useState } from 'react';
import { useTaskContext, TaskStatus, TaskPriority } from '@/components/TaskContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  SortAsc, 
  Calendar,
  User,
  Flag,
  MoreHorizontal,
  CheckCircle2,
  Paperclip,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isPast } from 'date-fns';
import { Card } from '@/components/ui/card';

const statusConfig = {
  todo: { label: 'To Do', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  review: { label: 'Review', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  done: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' }
};

const priorityConfig = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  medium: { label: 'Medium', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
};

export function TaskList() {
  const { tasks, currentTeam, updateTask, deleteTask } = useTaskContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'created'>('dueDate');

  const filteredTasks = tasks
    .filter(task => task.teamId === currentTeam?.id)
    .filter(task => 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(task => filterStatus === 'all' || task.status === filterStatus)
    .filter(task => filterPriority === 'all' || task.priority === filterPriority)
    .sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });

  const toggleTaskComplete = (taskId: string, currentStatus: TaskStatus) => {
    const newStatus = currentStatus === 'done' ? 'todo' : 'done';
    updateTask(taskId, { status: newStatus });
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Task List</h1>
        <p className="text-muted-foreground mt-1">
          Comprehensive view of all your team's tasks
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status: {filterStatus === 'all' ? 'All' : statusConfig[filterStatus as TaskStatus].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                All Statuses
              </DropdownMenuItem>
              {Object.entries(statusConfig).map(([status, config]) => (
                <DropdownMenuItem 
                  key={status} 
                  onClick={() => setFilterStatus(status as TaskStatus)}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Flag className="h-4 w-4" />
                Priority: {filterPriority === 'all' ? 'All' : priorityConfig[filterPriority as TaskPriority].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterPriority('all')}>
                All Priorities
              </DropdownMenuItem>
              {Object.entries(priorityConfig).map(([priority, config]) => (
                <DropdownMenuItem 
                  key={priority} 
                  onClick={() => setFilterPriority(priority as TaskPriority)}
                >
                  {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <SortAsc className="h-4 w-4" />
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSortBy('dueDate')}>
                Due Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('priority')}>
                Priority
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('created')}>
                Created Date
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks.map((task) => {
          const assignee = currentTeam?.members.find(m => m.id === task.assigneeId);
          const isDueSoon = task.dueDate && isPast(task.dueDate) && task.status !== 'done';
          
          const getDueDateDisplay = () => {
            if (!task.dueDate) return null;
            if (isToday(task.dueDate)) return 'Today';
            if (isPast(task.dueDate)) return format(task.dueDate, 'MMM d') + ' (Overdue)';
            return format(task.dueDate, 'MMM d');
          };

          return (
            <Card key={task.id} className={cn(
              "p-4 hover:shadow-md transition-all duration-200 group",
              task.status === 'done' && "opacity-75"
            )}>
              <div className="flex items-center gap-4">
                {/* Checkbox */}
                <Checkbox
                  checked={task.status === 'done'}
                  onCheckedChange={() => toggleTaskComplete(task.id, task.status)}
                  className="mt-1"
                />

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h4 className={cn(
                        "font-medium text-sm mb-1",
                        task.status === 'done' && "line-through text-muted-foreground"
                      )}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Metadata */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Status */}
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs px-2 py-0.5", statusConfig[task.status].color)}
                        >
                          {statusConfig[task.status].label}
                        </Badge>

                        {/* Priority */}
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs px-2 py-0.5", priorityConfig[task.priority].color)}
                        >
                          {priorityConfig[task.priority].label}
                        </Badge>

                        {/* Due date */}
                        {task.dueDate && (
                          <div className={cn(
                            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
                            isDueSoon 
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            <Calendar className="h-3 w-3" />
                            <span>{getDueDateDisplay()}</span>
                          </div>
                        )}

                        {/* Attachments and Comments */}
                        {task.attachments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3" />
                            <span>{task.attachments.length}</span>
                          </div>
                        )}
                        {task.comments.length > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="h-3 w-3" />
                            <span>{task.comments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Assignee and Actions */}
                    <div className="flex items-center gap-2">
                      {assignee && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarImage src={assignee.avatar} alt={assignee.name} />
                            <AvatarFallback className="text-xs">
                              {assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Task</DropdownMenuItem>
                          <DropdownMenuItem>Duplicate</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600 focus:text-red-600"
                            onClick={() => deleteTask(task.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium text-foreground">No tasks found</h3>
            <p className="text-muted-foreground text-sm mt-1">
              {searchQuery ? 'Try adjusting your search or filters' : 'Create your first task to get started'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}