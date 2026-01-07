import { NextRequest, NextResponse } from 'next/server';
import { teamMemberDb, teamDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// PATCH /api/teams/[id]/members/[memberId]/move - Move member to another team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const { targetTeamId } = await request.json();

    if (!targetTeamId) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Target team ID is required' },
        { status: 400 }
      );
    }

    // Check if target team exists and is in the same organization
    const sourceTeam = await teamDb.getById(params.id);
    const targetTeam = await teamDb.getById(targetTeamId);

    if (!sourceTeam || !targetTeam) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    if (sourceTeam.organization_id !== targetTeam.organization_id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Cannot move member between different organizations' },
        { status: 400 }
      );
    }

    // Check if member is already in target team
    const existingMembership = await teamMemberDb.getMembership(targetTeamId, params.memberId);
    if (existingMembership) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Member is already in this team' },
        { status: 400 }
      );
    }

    // Add member to target team
    await teamMemberDb.add(targetTeamId, params.memberId, 'member');

    // Remove from source team
    await teamMemberDb.remove(params.id, params.memberId);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Member moved successfully',
    });
  } catch (error) {
    console.error('Error moving member:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
