import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.user.id;
    const NotificationService = await import('@/lib/services/notificationService');
    const result = await NotificationService.markAllAsRead(userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error marking all as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all as read' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler);
