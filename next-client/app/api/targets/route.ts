import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { WeeklyTarget, User } from '@/lib/db/models';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function getHandler(req: NextRequest, context: any) {
  try {
    const { userId, week_start, week_end } = Object.fromEntries(req.nextUrl.searchParams);

    if (!userId || !week_start || !week_end) {
      return NextResponse.json({
        success: false,
        message: 'userId, week_start, week_end are required'
      }, { status: 400 });
    }

    const record = await WeeklyTarget.findOne({
      where: { userId, week_start, week_end }
    });

    return NextResponse.json({
      success: true,
      data: record || null
    });
  } catch (error) {
    console.error('Error in getWeeklyTarget:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error fetching weekly target',
      error: (error as Error).message
    }, { status: 500 });
  }
}

async function postHandler(req: NextRequest, context: any) {
  try {
    const { userId, week_start, week_end, target_amount, achieved_amount } = await req.json();

    if (!userId || !week_start || !week_end) {
      return NextResponse.json({
        success: false,
        message: 'userId, week_start, week_end are required'
      }, { status: 400 });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const userName = `${user.firstname} ${user.lastname}`;

    const existing = await WeeklyTarget.findOne({
      where: { userId, week_start, week_end }
    });

    if (existing) {
      const oldTargetAmount = existing.target_amount;
      const oldAchievedAmount = existing.achieved_amount;

      if (target_amount != null) existing.target_amount = target_amount;
      if (achieved_amount != null) existing.achieved_amount = achieved_amount;

      await existing.save();

      // Send notifications
      try {
        const { notifyTargetUpdated, notifyTargetAchieved } = await import('@/lib/utils/notificationHelper');
        const io = (req as any).io;
        if (io) {
          if (target_amount != null && target_amount !== oldTargetAmount) {
            await notifyTargetUpdated(io, userId, {
              userName,
              targetAmount: target_amount,
              oldAmount: oldTargetAmount,
              weekStart: week_start,
              weekEnd: week_end,
            });
          }

          if (achieved_amount != null && target_amount != null &&
              achieved_amount >= target_amount && oldAchievedAmount < target_amount) {
            await notifyTargetAchieved(io, userId, {
              userName,
              targetAmount: target_amount,
              achievedAmount: achieved_amount,
            });
          }
        }
      } catch (notifError) {
        console.error('Error sending target notification:', notifError);
      }

      return NextResponse.json({
        success: true,
        message: 'Weekly target updated successfully',
        data: existing
      });
    }

    const newRecord = await WeeklyTarget.create({
      userId,
      week_start,
      week_end,
      target_amount: target_amount || 0,
      achieved_amount: achieved_amount || 0
    });

    // Send notification to admins about new target
    try {
      const { notifyTargetSet } = await import('@/lib/utils/notificationHelper');
      const io = (req as any).io;
      if (io && target_amount > 0) {
        await notifyTargetSet(io, userId, {
          userName,
          targetAmount: target_amount,
          weekStart: week_start,
          weekEnd: week_end,
        });
      }
    } catch (notifError) {
      console.error('Error sending new target notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Weekly target created successfully',
      data: newRecord
    }, { status: 201 });
  } catch (error) {
    console.error('Error in setWeeklyTarget:', error);
    return NextResponse.json({
      success: false,
      message: 'Server error while setting weekly target',
      error: (error as Error).message
    }, { status: 500 });
  }
}

export const GET = withAuth(getHandler);
export const POST = withAuth(postHandler);
