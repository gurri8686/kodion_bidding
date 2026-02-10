import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.user.id;
    const NotificationService = await import('@/lib/services/notificationService');
    const result = await NotificationService.deleteAllNotifications(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    return NextResponse.json(
      { error: 'Failed to delete all notifications' },
      { status: 500 }
    );
  }
}

export const DELETE = withAuth(handler);
