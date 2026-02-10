import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const userId = context.user.id;
    const { page, limit, isRead } = Object.fromEntries(req.nextUrl.searchParams);

    const NotificationService = await import('@/lib/services/notificationService');

    const result = await NotificationService.getUserNotifications(userId, {
      page: parseInt(page || '1'),
      limit: parseInt(limit || '20'),
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
