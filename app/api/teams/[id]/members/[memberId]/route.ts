import { NextRequest, NextResponse } from 'next/server';
import { teamMemberDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// PATCH /api/teams/[id]/members/[memberId] - Update a team member's role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const body = await request.json();

    if (!body.role) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Role is required' },
        { status: 400 }
      );
    }

    const member = await teamMemberDb.updateRole(params.id, params.memberId, body.role);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: member,
      message: 'Member updated successfully',
    });
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id]/members/[memberId] - Remove a member from a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    await teamMemberDb.remove(params.id, params.memberId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
