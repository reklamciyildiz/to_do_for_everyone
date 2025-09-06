'use client';

import React from 'react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
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

export function TaskBoard() {
  const { tasks, updateTask } = useTaskContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Update the task status when dragged to a different column
    if (destination.droppableId !== source.droppableId) {
      updateTask(draggableId, { status: destination.droppableId as TaskStatus });
    }
    // Note: We're not handling reordering within the same column in this implementation
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  const filteredTasks = React.useMemo(() => {
    if (!statusFilter) return tasks;
    return tasks.filter(task => task.status === statusFilter);
  }, [tasks, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Task Board</h2>
        <Button onClick={handleCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
      
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={!statusFilter ? 'default' : 'outline'}
          onClick={() => setStatusFilter(null)}
        >
          All
        </Button>
        {columns.map(column => (
          <Button 
            key={column.id}
            variant={statusFilter === column.id ? 'default' : 'outline'}
            onClick={() => setStatusFilter(column.id)}
          >
            {column.title}
          </Button>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = filteredTasks.filter(task => task.status === column.id);
            
            return (
              <div key={column.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{column.title}</h3>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        'p-4 rounded-lg min-h-[200px] transition-colors',
                        column.color
                      )}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2"
                            >
                              <TaskCard task={task} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <CreateTaskModal 
        open={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}