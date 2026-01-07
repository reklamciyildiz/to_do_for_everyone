import { NextRequest, NextResponse } from 'next/server';
import { createUserWithOrganization, joinOrganizationViaInvitation, userDb } from '@/lib/db';
import { ApiResponse } from '@/lib/types';

// POST /api/auth/register - Register a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, name, organizationName, invitationToken } = body;

    if (!email || !name) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await userDb.getByEmail(email);
    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    let result;

    if (invitationToken) {
      // Join existing organization via invitation
      result = await joinOrganizationViaInvitation(email, name, invitationToken);
    } else if (organizationName) {
      // Create new organization
      result = await createUserWithOrganization(email, name, organizationName);
    } else {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Organization name or invitation token is required' },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<any>>({
      success: true,
      data: result,
      message: 'Registration successful',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
