/**
 * PUT /api/notifications/[id]/read - Mark notification as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const PUT = withAuth(async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
  user: AuthenticatedUser
) => {
  try {
    const params = await context.params;
    const id = parseInt(params.id);

    const notification = await NotificationService.markAsRead(id, user.id);

    return NextResponse.json(notification);
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 404 }
    );
  }
});
