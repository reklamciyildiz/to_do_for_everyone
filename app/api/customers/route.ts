import { NextRequest, NextResponse } from 'next/server';
import { customerDb } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/customers - Get all customers for the organization
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customers = await customerDb.getByOrganization(user.organizationId);

    // Get task stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer: any) => {
        const stats = await customerDb.getTaskStats(customer.id);
        return { ...customer, taskStats: stats };
      })
    );

    return NextResponse.json({
      success: true,
      data: customersWithStats,
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/customers - Create a new customer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.organizationId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has permission (admin or owner)
    const userRole = user.role;
    if (userRole !== 'admin' && userRole !== 'owner') {
      return NextResponse.json(
        { success: false, error: 'Permission denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone, address, notes } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Customer name is required' },
        { status: 400 }
      );
    }

    const customer = await customerDb.create({
      name: name.trim(),
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      address: address?.trim() || null,
      notes: notes?.trim() || null,
      organization_id: user.organizationId,
    });

    return NextResponse.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
