import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.user.id;
    const { id } = context.params;

    const NotificationService = await import('@/lib/services/notificationService');
    const notification = await NotificationService.markAsRead(parseInt(id), userId);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 404 }
    );
  }
}

export const PUT = withAuth(handler);
