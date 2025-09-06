'use client';

import * as React from 'react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from './DragAndDrop';
import { TaskCard } from '@/components/TaskCard';
import { useTaskContext, TaskStatus } from '@/components/TaskContext';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { cn } from '@/lib/utils';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'review', title: 'Review', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
];

export function TaskBoard(): JSX.Element {
  const { tasks, updateTask, currentTeam } = useTaskContext();
  const [showCreateTask, setShowCreateTask] = useState<{ status?: TaskStatus } | false>(false);

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as TaskStatus;
    
    updateTask(taskId, { status: newStatus });
  };

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => 
      task.status === status && 
      task.teamId === currentTeam?.id
    );
  };

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Task Board</h1>
        <p className="text-muted-foreground mt-1">
          Manage your team's workflow with our advanced kanban board
        </p>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {columns.map((column) => {
            const columnTasks = getTasksByStatus(column.id);
            
            return (
              <div key={column.id} className="flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-foreground">
                      {column.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs">
                      {columnTasks.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    onClick={() => setShowCreateTask({ status: column.id })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided: any, snapshot: any) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 rounded-lg p-3 transition-colors min-h-[200px]",
                        column.color,
                        snapshot.isDraggingOver && "ring-2 ring-primary/50"
                      )}
                    >
                      <div className="space-y-3">
                        {columnTasks.map((task, index) => (
                          <Draggable 
                            key={task.id} 
                            draggableId={task.id} 
                            index={index}
                          >
                            {(provided: any, snapshot: any) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={cn(
                                  "transition-transform",
                                  snapshot.isDragging && "rotate-3 scale-105"
                                )}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create task modal */}
      <CreateTaskModal 
        open={!!showCreateTask} 
        onClose={() => setShowCreateTask(false)}
        defaultStatus={typeof showCreateTask === 'object' ? showCreateTask.status : undefined}
      />
    </div>
  );
}