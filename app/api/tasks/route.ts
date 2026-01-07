import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { taskDb, userDb, notificationDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/tasks - Get all tasks (optionally filtered by teamId or organizationId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const organizationId = searchParams.get('organizationId');

    let tasks;
    if (teamId) {
      tasks = await taskDb.getByTeam(teamId);
    } else if (organizationId) {
      tasks = await taskDb.getByOrganization(organizationId);
    } else {
      // If no filter, try to get user's organization tasks
      if (session?.user?.email) {
        const user: any = await userDb.getByEmail(session.user.email);
        if (user) {
          tasks = await taskDb.getByOrganization(user.organization_id);
        }
      }
      tasks = tasks || [];
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: tasks,
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!body.title || !body.teamId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Title and teamId are required' },
        { status: 400 }
      );
    }

    // Get user from session or use provided userId
    let userId = body.createdBy;
    let organizationId = body.organizationId;

    if (session?.user?.email) {
      const user: any = await userDb.getByEmail(session.user.email);
      if (user) {
        userId = user.id;
        organizationId = user.organization_id;
      }
    }

    if (!userId || !organizationId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    const task = await taskDb.create({
      title: body.title,
      description: body.description || null,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      due_date: body.dueDate || null,
      assignee_id: body.assigneeId || null,
      team_id: body.teamId,
      organization_id: organizationId,
      created_by: userId,
    });

    // Send notification if task is assigned to someone
    if (body.assigneeId && body.assigneeId !== userId) {
      try {
        const creator = await userDb.getById(userId);
        await notificationDb.create({
          user_id: body.assigneeId,
          organization_id: organizationId,
          type: 'task_assigned',
          title: 'New task assigned to you',
          message: `${creator?.name || 'Someone'} assigned you: "${body.title}"`,
          link: '/?view=board',
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: task,
      message: 'Task created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
