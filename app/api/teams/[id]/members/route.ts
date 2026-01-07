import { NextRequest, NextResponse } from 'next/server';
import { teamMemberDb, userDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/teams/[id]/members - Get all members of a team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const members = await teamMemberDb.getByTeam(params.id);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams/[id]/members - Add a member to a team
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    if (!body.userId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const member = await teamMemberDb.add(
      params.id,
      body.userId,
      body.role || 'member'
    );

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: member,
      message: 'Member added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
