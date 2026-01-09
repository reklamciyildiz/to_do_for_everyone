import { NextRequest, NextResponse } from 'next/server';
import { taskDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/tasks/[id] - Get a specific task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const task = await taskDb.getById(params.id);

    if (!task) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/[id] - Update a task
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updatedTask = await taskDb.update(params.id, {
      title: body.title,
      description: body.description,
      status: body.status,
      priority: body.priority,
      due_date: body.dueDate,
      assignee_id: body.assigneeId === undefined ? undefined : (body.assigneeId || null),
      customer_id: body.customerId === undefined ? undefined : (body.customerId || null),
    });

    if (!updatedTask) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: updatedTask,
      message: 'Task updated successfully',
    });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await taskDb.delete(params.id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
