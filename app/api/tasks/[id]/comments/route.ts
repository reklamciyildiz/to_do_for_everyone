import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { commentDb, userDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// POST /api/tasks/[id]/comments - Add a comment to a task
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!body.text) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Comment text is required' },
        { status: 400 }
      );
    }

    // Get user from session
    let userId = body.authorId;
    if (session?.user?.email) {
      const user: any = await userDb.getByEmail(session.user.email);
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User authentication required' },
        { status: 401 }
      );
    }

    const comment = await commentDb.create(params.id, userId, body.text);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: comment,
      message: 'Comment added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
