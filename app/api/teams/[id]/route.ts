import { NextRequest, NextResponse } from 'next/server';
import { teamDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// GET /api/teams/[id] - Get a specific team
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await teamDb.getById(params.id);

    if (!team) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/teams/[id] - Update a team
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const updatedTeam = await teamDb.update(params.id, {
      name: body.name,
      description: body.description,
    });

    if (!updatedTeam) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: updatedTeam,
      message: 'Team updated successfully',
    });
  } catch (error) {
    console.error('Error updating team:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Delete a team
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await teamDb.delete(params.id);

    return NextResponse.json<ApiResponse<null>>({
      success: true,
      message: 'Team deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
