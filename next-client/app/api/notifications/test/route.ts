import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const io = (req as any).io;
    const userId = context.user.id;

    const NotificationService = await import('@/lib/services/notificationService');
    const notification = await NotificationService.createNotification(io, {
      userId,
      type: 'system_alert',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working!',
      priority: 'medium',
      icon: '🔔',
    });

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler);
