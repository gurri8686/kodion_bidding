import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  const userId = context.params.id;

  try {
    const { status } = await req.json();

    if (!['active', 'blocked'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid status value' },
        { status: 400 }
      );
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    user.status = status;
    await user.save();

    // Send notification
    try {
      const { notifyUserBlocked, notifyUserActivated } = await import('@/lib/utils/notificationHelper');
      const io = (req as any).io;
      const admin = context.user;

      if (io && user) {
        const adminName = admin ? `${admin.firstname} ${admin.lastname}` : 'Admin';

        if (status === 'blocked') {
          await notifyUserBlocked(io, userId, adminName);
        } else if (status === 'active') {
          await notifyUserActivated(io, userId, adminName);
        }
      }
    } catch (notifError) {
      console.error('Error sending notification:', notifError);
    }

    return NextResponse.json({ message: `User ${status} successfully.` });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
}

export const PUT = withAuth(handler);
