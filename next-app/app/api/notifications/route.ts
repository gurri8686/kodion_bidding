/**
 * GET /api/notifications - Get user's notifications with pagination
 * POST /api/notifications - Create test notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import NotificationService from '@/lib/services/notificationService';

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isReadParam = searchParams.get('isRead');

    const result = await NotificationService.getUserNotifications(user.id, {
      page,
      limit,
      isRead: isReadParam !== null ? isReadParam === 'true' : undefined,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const body = await req.json();
    const { type, title, message, priority, icon, actionUrl, metadata } = body;

    const notification = await NotificationService.createNotification({
      userId: user.id,
      type: type || 'system_alert',
      title: title || 'Test Notification',
      message: message || 'This is a test notification',
      priority: priority || 'medium',
      icon: icon || '🔔',
      actionUrl,
      metadata,
    });

    return NextResponse.json(
      { success: true, notification },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
});
