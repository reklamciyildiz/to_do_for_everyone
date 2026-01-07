import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { teamDb, teamMemberDb, userDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/teams - Get all teams (optionally filtered by userId or organizationId)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const organizationId = searchParams.get('organizationId');

    let teams;
    if (userId) {
      teams = await teamDb.getByUser(userId);
    } else if (organizationId) {
      teams = await teamDb.getByOrganization(organizationId);
    } else if (session?.user?.email) {
      const user: any = await userDb.getByEmail(session.user.email);
      if (user) {
        teams = await teamDb.getByOrganization(user.organization_id);
      }
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: teams || [],
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Team name is required' },
        { status: 400 }
      );
    }

    // Get user from session
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

    // Create team
    const team: any = await teamDb.create({
      name: body.name,
      description: body.description || null,
      organization_id: organizationId,
      created_by: userId,
    });

    // Add creator as admin member
    await teamMemberDb.add(team.id, userId, 'admin');

    // Get updated team with members
    const updatedTeam: any = await teamDb.getById(team.id);

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: updatedTeam,
      message: 'Team created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating team:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
