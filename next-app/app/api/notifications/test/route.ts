/**
 * POST /api/notifications/test - Send test notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const notification = await NotificationService.createNotification({
      userId: user.id,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      priority: 'medium',
      icon: '🔔',
    });

    return NextResponse.json({ success: true, notification });
  } catch (error: any) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
});
