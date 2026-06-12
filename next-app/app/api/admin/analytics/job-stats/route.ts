/**
 * GET /api/admin/analytics/job-stats
 * Get comprehensive job statistics with filters
 * Supports filtering by platform, profile, user, and date range
 *
 * The applied_jobs dataset is small, so instead of issuing ~20 separate
 * GROUP BY round-trips to a remote DB, we fetch the filtered rows once and
 * aggregate them in JavaScript. This collapses the endpoint to ~5 queries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { withAdminAuth } from '@/lib/middleware/auth';
import {
  AppliedJob,
  HiredJob,
  Platform,
  User,
  Profiles,
  WeeklyTargets,
} from '@/lib/db/models';
import { Op } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = withAdminAuth(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get('platform');
    const profileId = searchParams.get('profileId');
    const userId = searchParams.get('userId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const whereClause: any = {};

    // Apply filters
    if (platform) {
      whereClause.platformId = {
        [Op.in]: platform.split(',').map(Number),
      };
    }

    if (profileId) {
      whereClause.profileId = Number(profileId);
    }

    if (userId) {
      whereClause.userId = {
        [Op.in]: userId.split(',').map(Number),
      };
    }

    // Date filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      whereClause[Op.and] = [
        {
          [Op.or]: [
            { applied_at: { [Op.between]: [start, end] } },
            { replyDate: { [Op.between]: [start, end] } },
            { interviewDate: { [Op.between]: [start, end] } },
          ],
        },
      ];
    }

    // Weekly-target filter
    const weeklyWhere: any = {};

    if (userId) {
      weeklyWhere.userId = { [Op.in]: userId.split(',').map(Number) };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      weeklyWhere[Op.and] = [
        { week_start: { [Op.lte]: start } },
        { week_end: { [Op.gte]: end } },
      ];
    }

    // 5 parallel queries: metadata + the raw filtered rows + targets.
    const [platforms, users, profiles, appliedRows, hiredRows, targets] =
      await Promise.all([
        Platform.findAll({
          attributes: ['id', 'name', 'connect_cost_usd', 'connect_cost_inr'],
          raw: true,
        }),
        User.findAll({ attributes: ['id', 'firstname'], raw: true }),
        Profiles.findAll({ attributes: ['id', 'name'], raw: true }),
        AppliedJob.findAll({
          attributes: ['platformId', 'userId', 'profileId', 'connectsUsed', 'stage'],
          where: whereClause,
          raw: true,
        }),
        HiredJob.findAll({
          attributes: ['budgetAmount'],
          include: [
            {
              model: AppliedJob,
              as: 'appliedJobDetails',
              required: true,
              where: whereClause,
              attributes: ['platformId', 'userId', 'profileId'],
            },
          ],
          raw: true,
        }),
        WeeklyTargets.findAll({ where: weeklyWhere, raw: true }),
      ]);

    const platformById: any = {};
    const userById: any = {};
    const profileById: any = {};

    (platforms as any[]).forEach((p: any) => (platformById[p.id] = p));
    (users as any[]).forEach((u: any) => (userById[u.id] = u.firstname));
    (profiles as any[]).forEach((p: any) => (profileById[p.id] = p.name));

    // ---- Aggregate applied rows in JS ----
    const applied = appliedRows as any[];

    const connectsOf = (r: any) => Number(r.connectsUsed ?? r.connects_used ?? 0);

    const totalAppliedJobs = applied.length;
    const totalConnectsUsed = applied.reduce((s, r) => s + connectsOf(r), 0);

    const platformAggMap: Record<string, any> = {};
    const userAggMap: Record<string, any> = {};
    const profileAggMap: Record<string, any> = {};
    const userPlatformMap: Record<string, any> = {};
    const profilePlatformMap: Record<string, any> = {};
    const stageMap: Record<string, number> = {};
    const riPlatformMap: Record<string, any> = {};
    const riProfileMap: Record<string, any> = {};
    const riUserMap: Record<string, any> = {};

    for (const r of applied) {
      const connects = connectsOf(r);
      const pid = r.platformId;
      const uid = r.userId;
      const prid = r.profileId;
      const stage = r.stage;

      if (!platformAggMap[pid]) platformAggMap[pid] = { platformId: pid, connects: 0, applied: 0 };
      platformAggMap[pid].connects += connects;
      platformAggMap[pid].applied += 1;

      if (!userAggMap[uid]) userAggMap[uid] = { userId: uid, connects: 0, applied: 0 };
      userAggMap[uid].connects += connects;
      userAggMap[uid].applied += 1;

      if (!profileAggMap[prid]) profileAggMap[prid] = { profileId: prid, connects: 0, applied: 0 };
      profileAggMap[prid].connects += connects;
      profileAggMap[prid].applied += 1;

      const upKey = `${uid}|${pid}`;
      if (!userPlatformMap[upKey]) userPlatformMap[upKey] = { userId: uid, platformId: pid, connects: 0 };
      userPlatformMap[upKey].connects += connects;

      const ppKey = `${prid}|${pid}`;
      if (!profilePlatformMap[ppKey]) profilePlatformMap[ppKey] = { profileId: prid, platformId: pid, connects: 0 };
      profilePlatformMap[ppKey].connects += connects;

      stageMap[stage] = (stageMap[stage] || 0) + 1;

      if (stage === 'replied' || stage === 'interview') {
        const rpKey = `${pid}|${stage}`;
        if (!riPlatformMap[rpKey]) riPlatformMap[rpKey] = { platformId: pid, stage, count: 0 };
        riPlatformMap[rpKey].count += 1;

        const rprKey = `${prid}|${stage}`;
        if (!riProfileMap[rprKey]) riProfileMap[rprKey] = { profileId: prid, stage, count: 0 };
        riProfileMap[rprKey].count += 1;

        const ruKey = `${uid}|${stage}`;
        if (!riUserMap[ruKey]) riUserMap[ruKey] = { userId: uid, stage, count: 0 };
        riUserMap[ruKey].count += 1;
      }
    }

    const platformAgg = Object.values(platformAggMap);
    const userAgg = Object.values(userAggMap);
    const profileAgg = Object.values(profileAggMap);
    const userPlatformAgg = Object.values(userPlatformMap);
    const profilePlatformAgg = Object.values(profilePlatformMap);
    const stageAgg = Object.entries(stageMap).map(([stage, count]) => ({ stage, count }));
    const repliedInterviewPlatformAgg = Object.values(riPlatformMap);
    const repliedInterviewProfileAgg = Object.values(riProfileMap);
    const repliedInterviewUserAgg = Object.values(riUserMap);

    // ---- Aggregate hired rows in JS ----
    const hired = hiredRows as any[];

    const totalHiredJobs = hired.length;
    const totalHiredBudget = Number(
      hired.reduce((s, r) => s + Number(r.budgetAmount || 0), 0)
    );

    const hiredPlatformMap: Record<string, any> = {};
    const hiredUserMap: Record<string, any> = {};
    const hiredProfileMap: Record<string, any> = {};

    for (const r of hired) {
      const pid = r['appliedJobDetails.platformId'] ?? r.platformId;
      const uid = r['appliedJobDetails.userId'] ?? r.userId;
      const prid = r['appliedJobDetails.profileId'] ?? r.profileId;

      if (pid != null) {
        if (!hiredPlatformMap[pid]) hiredPlatformMap[pid] = { platformId: pid, count: 0 };
        hiredPlatformMap[pid].count += 1;
      }
      if (uid != null) {
        if (!hiredUserMap[uid]) hiredUserMap[uid] = { userId: uid, count: 0 };
        hiredUserMap[uid].count += 1;
      }
      if (prid != null) {
        if (!hiredProfileMap[prid]) hiredProfileMap[prid] = { profileId: prid, count: 0 };
        hiredProfileMap[prid].count += 1;
      }
    }

    const hiredPlatformAgg = Object.values(hiredPlatformMap);
    const hiredUserAgg = Object.values(hiredUserMap);
    const hiredProfileAgg = Object.values(hiredProfileMap);

    // Platform breakdowns
    const connectsBreakdown: any = {};
    const costBreakdown: any = {};
    const appliedJobsBreakdown: any = {};
    const hiredPlatformWise: any = {};

    (platforms as any[]).forEach((p: any) => {
      connectsBreakdown[p.name] = 0;
      costBreakdown[p.name] = 0;
      appliedJobsBreakdown[p.name] = 0;
      hiredPlatformWise[p.name] = 0;
    });

    (platformAgg as any[]).forEach((row: any) => {
      const pid = row.platformId;
      const p = platformById[pid];
      if (!p) return;

      connectsBreakdown[p.name] = Number(row.connects || 0);
      costBreakdown[p.name] = Number(
        (row.connects * (p.connect_cost_usd || 0)).toFixed(2)
      );
      appliedJobsBreakdown[p.name] = Number(row.applied || 0);
    });

    (hiredPlatformAgg as any[]).forEach((row: any) => {
      const p = platformById[row.platformId];
      if (p) hiredPlatformWise[p.name] = Number(row.count || 0);
    });

    // User breakdowns
    const appliedUserWise: any = {};
    const connectsUserWise: any = {};
    const costUserWise: any = {};
    const hiredUserWise: any = {};

    (users as any[]).forEach((u: any) => {
      appliedUserWise[u.firstname] = 0;
      connectsUserWise[u.firstname] = 0;
      costUserWise[u.firstname] = 0;
      hiredUserWise[u.firstname] = 0;
    });

    (userAgg as any[]).forEach((row: any) => {
      const name = userById[row.userId];
      appliedUserWise[name] = Number(row.applied || 0);
      connectsUserWise[name] = Number(row.connects || 0);
    });

    (userPlatformAgg as any[]).forEach((row: any) => {
      const name = userById[row.userId];
      const p = platformById[row.platformId];
      costUserWise[name] += Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costUserWise).forEach(
      (k) => (costUserWise[k] = Number(costUserWise[k].toFixed(2)))
    );

    (hiredUserAgg as any[]).forEach((row: any) => {
      const name = userById[row.userId];
      if (name) hiredUserWise[name] = Number(row.count || 0);
    });

    // Profile breakdowns
    const appliedProfileWise: any = {};
    const connectsProfileWise: any = {};
    const costProfileWise: any = {};
    const hiredProfileWise: any = {};

    (profiles as any[]).forEach((p: any) => {
      appliedProfileWise[p.name] = 0;
      connectsProfileWise[p.name] = 0;
      costProfileWise[p.name] = 0;
      hiredProfileWise[p.name] = 0;
    });

    (profileAgg as any[]).forEach((row: any) => {
      const name = profileById[row.profileId];
      appliedProfileWise[name] = Number(row.applied || 0);
      connectsProfileWise[name] = Number(row.connects || 0);
    });

    (profilePlatformAgg as any[]).forEach((row: any) => {
      const name = profileById[row.profileId];
      const p = platformById[row.platformId];
      costProfileWise[name] += Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costProfileWise).forEach(
      (k) => (costProfileWise[k] = Number(costProfileWise[k].toFixed(2)))
    );

    (hiredProfileAgg as any[]).forEach((row: any) => {
      const prof = profileById[row.profileId];
      if (prof) hiredProfileWise[prof] = Number(row.count || 0);
    });

    // Stage counts
    const stageCounts: any = {};
    (stageAgg as any[]).forEach((s: any) => {
      stageCounts[s.stage] = Number(s.count || 0);
    });

    const totalReplied = stageCounts['replied'] || 0;
    const totalInterviewed = stageCounts['interview'] || 0;
    const totalNotHired = stageCounts['not-hired'] || 0;

    // Platform replied/interview
    const repliedPlatformWise: any = {};
    const interviewPlatformWise: any = {};

    (platforms as any[]).forEach((p: any) => {
      repliedPlatformWise[p.name] = 0;
      interviewPlatformWise[p.name] = 0;
    });

    (repliedInterviewPlatformAgg as any[]).forEach((row: any) => {
      const p = platformById[row.platformId];
      if (!p) return;

      if (row.stage === 'replied') repliedPlatformWise[p.name] = Number(row.count);
      if (row.stage === 'interview') interviewPlatformWise[p.name] = Number(row.count);
    });

    // Profile replied/interview
    const repliedProfileWise: any = {};
    const interviewProfileWise: any = {};

    (profiles as any[]).forEach((p: any) => {
      repliedProfileWise[p.name] = 0;
      interviewProfileWise[p.name] = 0;
    });

    (repliedInterviewProfileAgg as any[]).forEach((row: any) => {
      const prof = profileById[row.profileId];
      if (!prof) return;

      if (row.stage === 'replied') repliedProfileWise[prof] = Number(row.count);
      if (row.stage === 'interview') interviewProfileWise[prof] = Number(row.count);
    });

    // User replied/interview
    const repliedUserWise: any = {};
    const interviewUserWise: any = {};

    (users as any[]).forEach((u: any) => {
      repliedUserWise[u.firstname] = 0;
      interviewUserWise[u.firstname] = 0;
    });

    (repliedInterviewUserAgg as any[]).forEach((row: any) => {
      const user = userById[row.userId];
      if (!user) return;

      if (row.stage === 'replied') repliedUserWise[user] = Number(row.count);
      if (row.stage === 'interview') interviewUserWise[user] = Number(row.count);
    });

    // Weekly target logic
    let weeklyTarget = {
      target_amount: 0,
      achieved_amount: 0,
      remaining: 0,
      percentage: 0,
    };

    let weeklyTargetUserWise: any = {};

    if (targets && targets.length > 0) {
      const totalTarget = (targets as any[]).reduce(
        (acc, t: any) => acc + (t.target_amount || 0),
        0
      );
      const totalAchieved = (targets as any[]).reduce(
        (acc, t: any) => acc + (t.achieved_amount || 0),
        0
      );

      weeklyTarget = {
        target_amount: totalTarget,
        achieved_amount: totalAchieved,
        remaining: totalTarget - totalAchieved,
        percentage: totalTarget
          ? Number(((totalAchieved / totalTarget) * 100).toFixed(2))
          : 0,
      };

      (targets as any[]).forEach((t: any) => {
        const name = userById[t.userId] || `user_${t.userId}`;
        const targetAmt = t.target_amount || 0;
        const achievedAmt = t.achieved_amount || 0;

        weeklyTargetUserWise[name] = {
          target: targetAmt,
          achieved: achievedAmt,
          remaining: targetAmt - achievedAmt,
          percentage: targetAmt
            ? Number(((achievedAmt / targetAmt) * 100).toFixed(2))
            : 0,
        };
      });
    }

    // Summaries
    const totalConnectsCostUSD = Object.values(costBreakdown).reduce(
      (a: any, b: any) => a + (b || 0),
      0
    );

    let totalConnectsCostINR = 0;
    for (const pfName of Object.keys(connectsBreakdown)) {
      const used = connectsBreakdown[pfName] || 0;
      const plat = (platforms as any[]).find((p: any) => p.name === pfName);
      const inr = (plat as any)?.connect_cost_inr || 0;
      totalConnectsCostINR += used * inr;
    }
    totalConnectsCostINR = Number(totalConnectsCostINR.toFixed(2));

    return NextResponse.json({
      summary: {
        totalAppliedJobs,
        totalConnectsUsed,
        totalConnectsCostUSD,
        totalConnectsCostINR,
        appliedJobsBreakdown,
        connectsBreakdown,
        costBreakdown,

        appliedUserWise,
        connectsUserWise,
        costUserWise,

        appliedProfileWise,
        connectsProfileWise,
        costProfileWise,

        totalReplied,
        totalInterviewed,
        totalNotHired,
        totalHiredJobs,
        totalHiredBudget,

        repliedPlatformWise,
        interviewPlatformWise,
        repliedProfileWise,
        interviewProfileWise,
        repliedUserWise,
        interviewUserWise,

        weeklyTarget,
        weeklyTargetUserWise,
        hiredPlatformWise,
        hiredUserWise,
        hiredProfileWise,
      },
    });
  } catch (error: any) {
    console.error('Error in getJobStats:', error);
    return NextResponse.json(
      { message: 'Server error', error: error.message || error.toString() },
      { status: 500 }
    );
  }
});
