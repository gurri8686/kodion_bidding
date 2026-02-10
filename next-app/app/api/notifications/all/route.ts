/**
 * DELETE /api/notifications/all - Delete all notifications for user
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const DELETE = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const result = await NotificationService.deleteAllNotifications(user.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete all notifications' },
      { status: 500 }
    );
  }
});
