import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.user.id;
    const { id } = context.params;

    const NotificationService = await import('@/lib/services/notificationService');
    const result = await NotificationService.deleteNotification(parseInt(id), userId);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 404 }
    );
  }
}

export const DELETE = withAuth(handler);
