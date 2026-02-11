/**
 * DELETE /api/notifications/[id] - Delete notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const DELETE = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const result = await NotificationService.deleteNotification(id, user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
});
