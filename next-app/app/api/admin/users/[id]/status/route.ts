/**
 * PUT /api/admin/users/[id]/status
 * Toggle user status (block/activate) and send notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import { User } from '@/lib/db/models';
import { notifyUserBlocked, notifyUserActivated } from '@/lib/utils/notificationHelper';

export const PUT = withAdminAuth(
  async (req: NextRequest, context: { params?: any }, adminUser) => {
    try {
      const { id: userId } = await context.params;
      const body = await req.json();
      const { status } = body;

      console.log('Toggle user status:', userId, 'to', status);

      // Validate status value
      if (!['active', 'blocked'].includes(status)) {
        return NextResponse.json(
          { message: 'Invalid status value. Must be "active" or "blocked"' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findByPk(userId);

      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      // Update user status
      user.status = status;
      await user.save();

      // Send notification to user
      try {
        const adminName = `${adminUser.firstname} ${adminUser.lastname}`;

        if (status === 'blocked') {
          await notifyUserBlocked(parseInt(userId), adminName);
        } else if (status === 'active') {
          await notifyUserActivated(parseInt(userId), adminName);
        }
      } catch (notifError) {
        console.error('Error sending notification:', notifError);
        // Don't fail the request if notification fails
      }

      return NextResponse.json({
        message: `User ${status} successfully.`,
        user: {
          id: user.id,
          email: user.email,
          status: user.status,
        },
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      return NextResponse.json(
        { message: 'Server error', error: error.message },
        { status: 500 }
      );
    }
  }
);
