/**
 * GET /api/targets - Get weekly target
 * POST /api/targets - Set/Update weekly target
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedUser } from '@/lib/middleware/auth';
import { WeeklyTargets, User } from '@/lib/db/models';
import {
  notifyTargetSet,
  notifyTargetUpdated,
  notifyTargetAchieved,
} from '@/lib/utils/notificationHelper';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  user: AuthenticatedUser
) => {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const week_start = searchParams.get('week_start');
    const week_end = searchParams.get('week_end');

    if (!userId || !week_start || !week_end) {
      return NextResponse.json(
        {
          success: false,
          message: 'userId, week_start, week_end are required',
        },
        { status: 400 }
      );
    }

    const record = await WeeklyTargets.findOne({
      where: { userId, week_start, week_end },
    });

    return NextResponse.json({
      success: true,
      data: record || null,
    });
  } catch (error: any) {
    console.error('Error in getWeeklyTarget:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error fetching weekly target',
        error: error.message,
      },
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
    const { userId, week_start, week_end, target_amount, achieved_amount } =
      await req.json();

    if (!userId || !week_start || !week_end) {
      return NextResponse.json(
        {
          success: false,
          message: 'userId, week_start, week_end are required',
        },
        { status: 400 }
      );
    }

    // Get user details for notifications
    const targetUser = await User.findByPk(userId);
    if (!targetUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User not found',
        },
        { status: 404 }
      );
    }

    const userName = `${targetUser.firstname} ${targetUser.lastname}`;

    // Check existing target for that week
    const existing = await WeeklyTargets.findOne({
      where: { userId, week_start, week_end },
    });

    if (existing) {
      const oldTargetAmount = existing.target_amount;
      const oldAchievedAmount = existing.achieved_amount;

      if (target_amount != null) existing.target_amount = target_amount;
      if (achieved_amount != null) existing.achieved_amount = achieved_amount;

      await existing.save();

      // Send notifications
      try {
        // If target amount changed, notify admins
        if (target_amount != null && target_amount !== oldTargetAmount) {
          await notifyTargetUpdated(userId, {
            userName,
            targetAmount: target_amount,
            oldAmount: oldTargetAmount,
            weekStart: week_start,
            weekEnd: week_end,
          });
        }

        // Check if target achieved
        if (
          achieved_amount != null &&
          target_amount != null &&
          achieved_amount >= target_amount &&
          oldAchievedAmount < target_amount
        ) {
          await notifyTargetAchieved(userId, {
            userName,
            targetAmount: target_amount,
            achievedAmount: achieved_amount,
          });
        }
      } catch (notifError) {
        console.error('Error sending target notification:', notifError);
        // Don't fail the request if notification fails
      }

      return NextResponse.json({
        success: true,
        message: 'Weekly target updated successfully',
        data: existing,
      });
    }

    // Create new weekly target
    const newRecord = await WeeklyTargets.create({
      userId,
      week_start,
      week_end,
      target_amount: target_amount || 0,
      achieved_amount: achieved_amount || 0,
    });

    // Send notification to admins about new target
    try {
      if (target_amount > 0) {
        await notifyTargetSet(userId, {
          userName,
          targetAmount: target_amount,
          weekStart: week_start,
          weekEnd: week_end,
        });
      }
    } catch (notifError) {
      console.error('Error sending new target notification:', notifError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Weekly target created successfully',
        data: newRecord,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error in setWeeklyTarget:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error while setting weekly target',
        error: error.message,
      },
      { status: 500 }
    );
  }
});
