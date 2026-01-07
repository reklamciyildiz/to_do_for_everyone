import { NextRequest, NextResponse } from 'next/server';
import { userDb, teamMemberDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/organizations/[id]/available-members - Get members available for team assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeTeamId = searchParams.get('excludeTeamId');

    // Get all users in the organization
    const organizationUsers = await userDb.getByOrganization(params.id);

    // If excludeTeamId is provided, exclude members already in that team
    if (excludeTeamId) {
      const teamMembers = await teamMemberDb.getByTeam(excludeTeamId);
      const teamMemberIds = teamMembers.map((tm: any) => tm.user_id);
      
      const availableUsers = organizationUsers.filter(
        (user: any) => !teamMemberIds.includes(user.id)
      );

      return NextResponse.json<ApiResponse<any>>({
        success: true,
        data: availableUsers,
      });
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: organizationUsers,
    });
  } catch (error) {
    console.error('Error fetching available members:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
