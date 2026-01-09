'use client';

import React from 'react';
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { TaskCard } from '@/components/TaskCard';
import { useTaskContext, TaskStatus } from '@/components/TaskContext';
import { Task } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateTaskModal } from '@/components/CreateTaskModal';
import { EditTaskModal } from '@/components/EditTaskModal';
import { cn } from '@/lib/utils';
import { isToday } from 'date-fns';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'progress', title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/20' },
  { id: 'review', title: 'Review', color: 'bg-orange-50 dark:bg-orange-900/20' },
  { id: 'done', title: 'Done', color: 'bg-green-50 dark:bg-green-900/20' }
];

export function TaskBoard() {
  const { tasks, updateTask, filter, setFilter, currentUser, currentTeam, permissions, canCompleteTask, canEditTask, customers, customerFilter, setCustomerFilter } = useTaskContext();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | null>(null);

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Update the task status when dragged to a different column
    if (destination.droppableId !== source.droppableId) {
      const task = tasks.find(t => t.id === draggableId);
      
      if (!task) return;
      
      // Check permission for completing task (moving to done)
      if (destination.droppableId === 'done') {
        if (!canCompleteTask(task.assigneeId)) {
          return; // User doesn't have permission to complete this task
        }
      }
      
      // Check general edit permission for this specific task
      if (!canEditTask(task.createdBy, task.assigneeId)) {
        return; // User doesn't have permission to edit this task
      }
      
      updateTask(draggableId, { status: destination.droppableId as TaskStatus });
    }
  };

  const handleCreateTask = () => {
    setIsCreateModalOpen(true);
  };

  // Apply quick filters from sidebar
  const filteredTasks = React.useMemo(() => {
    // First filter by current team
    let result = tasks.filter(task => task.teamId === currentTeam?.id);
    
    // Apply quick filter from sidebar
    if (filter === 'dueToday') {
      result = result.filter(task => task.dueDate && isToday(task.dueDate) && task.status !== 'done');
    } else if (filter === 'highPriority') {
      result = result.filter(task => (task.priority === 'high' || task.priority === 'urgent') && task.status !== 'done');
    } else if (filter === 'assignedToMe') {
      result = result.filter(task => task.assigneeId === currentUser?.id && task.status !== 'done');
    }
    
    // Apply customer filter
    if (customerFilter) {
      result = result.filter(task => task.customerId === customerFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      result = result.filter(task => task.status === statusFilter);
    }
    
    return result;
  }, [tasks, statusFilter, filter, customerFilter, currentUser?.id, currentTeam?.id]);

  const getFilterLabel = () => {
    if (filter === 'dueToday') return 'Due Today';
    if (filter === 'highPriority') return 'High Priority';
    if (filter === 'assignedToMe') return 'Assigned to Me';
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Task Board</h2>
          {filter && (
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              {getFilterLabel()}
              <button onClick={() => setFilter(null)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {customerFilter && (
            <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
              {customers.find(c => c.id === customerFilter)?.name || 'Customer'}
              <button onClick={() => setCustomerFilter(null)} className="ml-1 hover:text-red-500">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {customers.length > 0 && (
            <select
              value={customerFilter || ''}
              onChange={(e) => setCustomerFilter(e.target.value || null)}
              className="h-10 px-3 py-2 text-sm border rounded-md bg-background"
            >
              <option value="">All Customers</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          )}
          {permissions.canCreateTask && (
            <Button onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          )}
        </div>
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
                              className="mb-2"
                            >
                              <TaskCard 
                                task={task} 
                                dragHandleProps={provided.dragHandleProps}
                                onTaskClick={setEditingTask}
                              />
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

      <EditTaskModal 
        task={editingTask} 
        open={!!editingTask} 
        onClose={() => setEditingTask(null)} 
      />
    </div>
  );
}