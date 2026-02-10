import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { User, Platform, Profiles, AppliedJob, HiredJob, WeeklyTarget } from '@/lib/db/models';
import { Op, fn, col } from 'sequelize';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function handler(req: NextRequest, context: any) {
  try {
    const { platform, profileId, userId, startDate, endDate } = Object.fromEntries(req.nextUrl.searchParams);
    const whereClause: any = {};

    // APPLY FILTERS
    if (platform) {
      whereClause.platformId = {
        [Op.in]: platform.split(',').map(Number),
      };
    }

    if (profileId) whereClause.profileId = Number(profileId);

    if (userId) {
      whereClause.userId = {
        [Op.in]: userId.split(',').map(Number),
      };
    }

    // FIXED DATE FILTER
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

    // Fetch metadata
    const [platforms, users, profiles] = await Promise.all([
      Platform.findAll({
        attributes: ['id', 'name', 'connect_cost_usd', 'connect_cost_inr'],
      }),
      User.findAll({
        attributes: ['id', 'firstname'],
      }),
      Profiles.findAll({
        attributes: ['id', 'name'],
      }),
    ]);

    const platformById: any = {};
    const userById: any = {};
    const profileById: any = {};

    platforms.forEach((p: any) => (platformById[p.id] = p));
    users.forEach((u: any) => (userById[u.id] = u.firstname));
    profiles.forEach((p: any) => (profileById[p.id] = p.name));

    // Aggregated queries
    const platformAgg = await AppliedJob.findAll({
      attributes: [
        'platformId',
        [fn('SUM', col('connects_used')), 'connects'],
        [fn('COUNT', col('id')), 'applied'],
      ],
      where: whereClause,
      group: ['platformId'],
      raw: true,
    });

    const userAgg = await AppliedJob.findAll({
      attributes: [
        'userId',
        [fn('SUM', col('connects_used')), 'connects'],
        [fn('COUNT', col('id')), 'applied'],
      ],
      where: whereClause,
      group: ['userId'],
      raw: true,
    });

    const profileAgg = await AppliedJob.findAll({
      attributes: [
        'profileId',
        [fn('SUM', col('connects_used')), 'connects'],
        [fn('COUNT', col('id')), 'applied'],
      ],
      where: whereClause,
      group: ['profileId'],
      raw: true,
    });

    const userPlatformAgg = await AppliedJob.findAll({
      attributes: [
        'userId',
        'platformId',
        [fn('SUM', col('connects_used')), 'connects'],
      ],
      where: whereClause,
      group: ['userId', 'platformId'],
      raw: true,
    });

    const profilePlatformAgg = await AppliedJob.findAll({
      attributes: [
        'profileId',
        'platformId',
        [fn('SUM', col('connects_used')), 'connects'],
      ],
      where: whereClause,
      group: ['profileId', 'platformId'],
      raw: true,
    });

    const stageAgg = await AppliedJob.findAll({
      attributes: ['stage', [fn('COUNT', col('id')), 'count']],
      where: whereClause,
      group: ['stage'],
      raw: true,
    });

    // replied/interview - platform & profile
    const repliedInterviewPlatformAgg = await AppliedJob.findAll({
      attributes: ['platformId', 'stage', [fn('COUNT', col('id')), 'count']],
      where: { ...whereClause, stage: { [Op.in]: ['replied', 'interview'] } },
      group: ['platformId', 'stage'],
      raw: true,
    });

    const repliedInterviewProfileAgg = await AppliedJob.findAll({
      attributes: ['profileId', 'stage', [fn('COUNT', col('id')), 'count']],
      where: { ...whereClause, stage: { [Op.in]: ['replied', 'interview'] } },
      group: ['profileId', 'stage'],
      raw: true,
    });

    // replied/interview - user wise
    const repliedInterviewUserAgg = await AppliedJob.findAll({
      attributes: ['userId', 'stage', [fn('COUNT', col('id')), 'count']],
      where: { ...whereClause, stage: { [Op.in]: ['replied', 'interview'] } },
      group: ['userId', 'stage'],
      raw: true,
    });

    // Totals
    const [
      totalAppliedJobsRes,
      totalConnectsUsedRes,
      totalHiredJobsRes,
      totalHiredBudgetRes,
    ] = await Promise.all([
      AppliedJob.count({ where: whereClause }),
      AppliedJob.sum('connects_used', { where: whereClause }),
      HiredJob.count({
        include: [{ model: AppliedJob, as: 'appliedJobDetails', required: true, where: whereClause, attributes: [] }],
        subQuery: false,
      }),
      HiredJob.sum('budgetAmount', {
        include: [{ model: AppliedJob, as: 'appliedJobDetails', required: true, where: whereClause, attributes: [] }],
        subQuery: false,
      }),
    ]);

    const totalAppliedJobs = totalAppliedJobsRes || 0;
    const totalConnectsUsed = totalConnectsUsedRes || 0;
    const totalHiredJobs = totalHiredJobsRes || 0;
    const totalHiredBudget = Number(totalHiredBudgetRes || 0);

    // HIRED JOBS BREAKDOWNS
    const hiredPlatformAgg = await HiredJob.findAll({
      attributes: [
        [col('appliedJobDetails.platformId'), 'platformId'],
        [fn('COUNT', col('HiredJob.id')), 'count'],
      ],
      include: [
        {
          model: AppliedJob,
          as: 'appliedJobDetails',
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col('appliedJobDetails.platformId')],
      subQuery: false,
      raw: true,
    });

    const hiredUserAgg = await HiredJob.findAll({
      attributes: [
        [col('appliedJobDetails.userId'), 'userId'],
        [fn('COUNT', col('HiredJob.id')), 'count'],
      ],
      include: [
        {
          model: AppliedJob,
          as: 'appliedJobDetails',
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col('appliedJobDetails.userId')],
      subQuery: false,
      raw: true,
    });

    const hiredProfileAgg = await HiredJob.findAll({
      attributes: [
        [col('appliedJobDetails.profileId'), 'profileId'],
        [fn('COUNT', col('HiredJob.id')), 'count'],
      ],
      include: [
        {
          model: AppliedJob,
          as: 'appliedJobDetails',
          required: true,
          where: whereClause,
          attributes: [],
        },
      ],
      group: [col('appliedJobDetails.profileId')],
      subQuery: false,
      raw: true,
    });

    // PLATFORM BREAKDOWNS
    const connectsBreakdown: any = {};
    const costBreakdown: any = {};
    const appliedJobsBreakdown: any = {};
    const hiredPlatformWise: any = {};

    platforms.forEach((p: any) => {
      connectsBreakdown[p.name] = 0;
      costBreakdown[p.name] = 0;
      appliedJobsBreakdown[p.name] = 0;
      hiredPlatformWise[p.name] = 0;
    });

    platformAgg.forEach((row: any) => {
      const pid = row.platformId;
      const p = platformById[pid];
      if (!p) return;

      connectsBreakdown[p.name] = Number(row.connects || 0);
      costBreakdown[p.name] = Number(
        (row.connects * (p.connect_cost_usd || 0)).toFixed(2)
      );
      appliedJobsBreakdown[p.name] = Number(row.applied || 0);
    });

    hiredPlatformAgg.forEach((row: any) => {
      const p = platformById[row.platformId];
      if (p) hiredPlatformWise[p.name] = Number(row.count || 0);
    });

    // USER BREAKDOWNS
    const appliedUserWise: any = {};
    const connectsUserWise: any = {};
    const costUserWise: any = {};
    const hiredUserWise: any = {};

    users.forEach((u: any) => {
      appliedUserWise[u.firstname] = 0;
      connectsUserWise[u.firstname] = 0;
      costUserWise[u.firstname] = 0;
      hiredUserWise[u.firstname] = 0;
    });

    userAgg.forEach((row: any) => {
      const name = userById[row.userId];
      appliedUserWise[name] = Number(row.applied || 0);
      connectsUserWise[name] = Number(row.connects || 0);
    });

    userPlatformAgg.forEach((row: any) => {
      const name = userById[row.userId];
      const p = platformById[row.platformId];
      costUserWise[name] +=
        Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costUserWise).forEach(
      (k) => (costUserWise[k] = Number(costUserWise[k].toFixed(2)))
    );

    hiredUserAgg.forEach((row: any) => {
      const name = userById[row.userId];
      if (name) hiredUserWise[name] = Number(row.count || 0);
    });

    // PROFILE BREAKDOWNS
    const appliedProfileWise: any = {};
    const connectsProfileWise: any = {};
    const costProfileWise: any = {};
    const hiredProfileWise: any = {};

    profiles.forEach((p: any) => {
      appliedProfileWise[p.name] = 0;
      connectsProfileWise[p.name] = 0;
      costProfileWise[p.name] = 0;
      hiredProfileWise[p.name] = 0;
    });

    profileAgg.forEach((row: any) => {
      const name = profileById[row.profileId];
      appliedProfileWise[name] = Number(row.applied || 0);
      connectsProfileWise[name] = Number(row.connects || 0);
    });

    profilePlatformAgg.forEach((row: any) => {
      const name = profileById[row.profileId];
      const p = platformById[row.platformId];
      costProfileWise[name] +=
        Number(row.connects || 0) * (p?.connect_cost_usd || 0);
    });

    Object.keys(costProfileWise).forEach(
      (k) => (costProfileWise[k] = Number(costProfileWise[k].toFixed(2)))
    );

    hiredProfileAgg.forEach((row: any) => {
      const prof = profileById[row.profileId];
      if (prof) hiredProfileWise[prof] = Number(row.count || 0);
    });

    // STAGE COUNTS
    const stageCounts: any = {};
    stageAgg.forEach((s: any) => {
      stageCounts[s.stage] = Number(s.count || 0);
    });

    const totalReplied = stageCounts['replied'] || 0;
    const totalInterviewed = stageCounts['interview'] || 0;
    const totalNotHired = stageCounts['not-hired'] || 0;

    // PLATFORM → replied/interview
    const repliedPlatformWise: any = {};
    const interviewPlatformWise: any = {};

    platforms.forEach((p: any) => {
      repliedPlatformWise[p.name] = 0;
      interviewPlatformWise[p.name] = 0;
    });

    repliedInterviewPlatformAgg.forEach((row: any) => {
      const p = platformById[row.platformId];
      if (!p) return;

      if (row.stage === 'replied')
        repliedPlatformWise[p.name] = Number(row.count);

      if (row.stage === 'interview')
        interviewPlatformWise[p.name] = Number(row.count);
    });

    // PROFILE → replied/interview
    const repliedProfileWise: any = {};
    const interviewProfileWise: any = {};

    profiles.forEach((p: any) => {
      repliedProfileWise[p.name] = 0;
      interviewProfileWise[p.name] = 0;
    });

    repliedInterviewProfileAgg.forEach((row: any) => {
      const prof = profileById[row.profileId];
      if (!prof) return;

      if (row.stage === 'replied') repliedProfileWise[prof] = Number(row.count);

      if (row.stage === 'interview')
        interviewProfileWise[prof] = Number(row.count);
    });

    // USER → replied/interview
    const repliedUserWise: any = {};
    const interviewUserWise: any = {};

    users.forEach((u: any) => {
      repliedUserWise[u.firstname] = 0;
      interviewUserWise[u.firstname] = 0;
    });

    repliedInterviewUserAgg.forEach((row: any) => {
      const user = userById[row.userId];
      if (!user) return;

      if (row.stage === 'replied') repliedUserWise[user] = Number(row.count);

      if (row.stage === 'interview')
        interviewUserWise[user] = Number(row.count);
    });

    // WEEKLY TARGET LOGIC
    let weeklyTarget = {
      target_amount: 0,
      achieved_amount: 0,
      remaining: 0,
      percentage: 0,
    };

    let weeklyTargetUserWise: any = {};
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

    const targets = await WeeklyTarget.findAll({
      where: weeklyWhere,
      raw: true,
    });

    if (targets && targets.length > 0) {
      const totalTarget = targets.reduce(
        (acc: number, t: any) => acc + (t.target_amount || 0),
        0
      );
      const totalAchieved = targets.reduce(
        (acc: number, t: any) => acc + (t.achieved_amount || 0),
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

      targets.forEach((t: any) => {
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
      const plat = platforms.find((p: any) => p.name === pfName);
      const inr = plat?.connect_cost_inr || 0;
      totalConnectsCostINR += used * inr;
    }
    totalConnectsCostINR = Number(totalConnectsCostINR.toFixed(2));

    // RESULT
    return NextResponse.json({
      summary: {
        totalAppliedJobs,
        totalConnectsUsed,
        totalConnectsCostUSD: totalConnectsCostUSD,
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
  } catch (error) {
    console.error('Error in getJobStats:', error);
    return NextResponse.json(
      { message: 'Server error', error: (error as Error).message || error },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);
