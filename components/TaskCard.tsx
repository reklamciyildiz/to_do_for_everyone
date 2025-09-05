'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  MessageCircle, 
  Paperclip, 
  MoreVertical,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { Task, useTaskContext } from '@/components/TaskContext';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
};

export function TaskCard({ task }: TaskCardProps) {
  const { currentTeam, updateTask, deleteTask } = useTaskContext();
  
  const assignee = currentTeam?.members.find(m => m.id === task.assigneeId);
  
  const getDueDateDisplay = () => {
    if (!task.dueDate) return null;
    
    if (isToday(task.dueDate)) return 'Today';
    if (isTomorrow(task.dueDate)) return 'Tomorrow';
    return format(task.dueDate, 'MMM d');
  };
  
  const isDueSoon = task.dueDate && isPast(task.dueDate) && task.status !== 'done';

  return (
    <Card className="p-4 bg-card hover:shadow-md transition-all duration-200 group border cursor-pointer">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm line-clamp-2 leading-relaxed">
            {task.title}
          </h4>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => updateTask(task.id, { status: 'done' })}>
                Mark as Done
              </DropdownMenuItem>
              <DropdownMenuItem>Edit Task</DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 focus:text-red-600"
                onClick={() => deleteTask(task.id)}
              >
                Delete Task
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Attachments preview */}
        {task.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.attachments.slice(0, 2).map((attachment, index) => (
              <div key={index} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                <Paperclip className="h-3 w-3" />
                <span className="truncate max-w-20">{attachment}</span>
              </div>
            ))}
            {task.attachments.length > 2 && (
              <div className="text-xs text-muted-foreground px-2 py-1">
                +{task.attachments.length - 2} more
              </div>
            )}
          </div>
        )}

        {/* Priority and Due Date */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="secondary" 
            className={cn("text-xs px-2 py-0.5", priorityColors[task.priority])}
          >
            {task.priority.toUpperCase()}
          </Badge>
          
          {task.dueDate && (
            <div className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md",
              isDueSoon 
                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" 
                : "bg-muted text-muted-foreground"
            )}>
              {isDueSoon ? (
                <AlertTriangle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{getDueDateDisplay()}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {assignee && (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={assignee.avatar} alt={assignee.name} />
                  <AvatarFallback className="text-xs">
                    {assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">
                  {assignee.name.split(' ')[0]}
                </span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {task.attachments.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            {task.comments.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}