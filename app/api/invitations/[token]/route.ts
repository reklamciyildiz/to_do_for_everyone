import { NextRequest, NextResponse } from 'next/server';
import { invitationDb, organizationDb } from '@/lib/db';

// GET - Get invitation details by token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    const invitation = await invitationDb.getByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invitation' },
        { status: 404 }
      );
    }

    // Get organization details
    let organization = null;
    try {
      organization = await organizationDb.getById(invitation.organization_id);
    } catch (e) {
      // Organization might not be accessible
    }

    return NextResponse.json({
      success: true,
      data: {
        id: invitation.id,
        email: invitation.email,
        organization_id: invitation.organization_id,
        team_id: invitation.team_id,
        role: invitation.role,
        expires_at: invitation.expires_at,
        organization: organization ? { name: organization.name } : null,
      },
    });
  } catch (error: any) {
    console.error('Get invitation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel/revoke an invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    const invitation = await invitationDb.getByToken(token);

    if (!invitation) {
      return NextResponse.json(
        { success: false, error: 'Invitation not found' },
        { status: 404 }
      );
    }

    await invitationDb.delete(invitation.id);

    return NextResponse.json({
      success: true,
      message: 'Invitation cancelled',
    });
  } catch (error: any) {
    console.error('Delete invitation error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
