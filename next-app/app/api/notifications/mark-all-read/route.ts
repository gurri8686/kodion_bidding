/**
 * PUT /api/notifications/mark-all-read - Mark all notifications as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const PUT = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const result = await NotificationService.markAllAsRead(user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
});
