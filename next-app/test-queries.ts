// Set env vars before dynamic imports
process.env.MYSQL_DB_NAME = 'kodion_bidding';
process.env.MYSQL_DB_USER = 'kodion_bidding';
process.env.MYSQL_DB_PASSWORD = 'godaddy.Kodion@2025';
process.env.MYSQL_DB_HOST = 'sg2plzcpnl509520.prod.sin2.secureserver.net';
process.env.MYSQL_DB_PORT = '3306';

async function main() {
  const { User, Technologies, AppliedJob, Profiles, HiredJob, Portfolio, Platform, Job } = await import('./lib/db/models');
  const { Op, Sequelize, fn, col } = await import('sequelize');

  let passed = 0;
  let failed = 0;

  // Test 1: Platform (tableName: 'Platforms')
  try {
    const p = await Platform.findAll({ attributes: ['id', 'name', 'connect_cost_usd', 'connect_cost_inr'] });
    console.log('1. Platform: PASS, count=', p.length);
    passed++;
  } catch (e: any) { console.error('1. Platform: FAIL -', e.message); failed++; }

  // Test 2: User activity (`User`.id in literals)
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: ['id', 'firstname', 'lastname', 'email', 'joinDate', 'lastActive',
        [Sequelize.literal('(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = `User`.id)'), 'appliedJobsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM ignored_jobs AS ij WHERE ij.userId = `User`.id)'), 'ignoredJobsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM hired_jobs AS hj WHERE hj.bidderId = `User`.id)'), 'hiredJobsCount'],
      ],
      include: [{ model: Technologies, as: 'technologies', through: { attributes: [] }, attributes: ['name'] }],
    });
    console.log('2. User activity: PASS, count=', users.length);
    passed++;
  } catch (e: any) { console.error('2. User activity: FAIL -', e.message); failed++; }

  // Test 3: Connects (AppliedJob.xxx in col/group/order)
  try {
    const usage = await AppliedJob.findAll({
      attributes: ['userId', 'profileId',
        [Sequelize.fn('SUM', Sequelize.col('AppliedJob.connects_used')), 'total_connects'],
        [Sequelize.fn('COUNT', Sequelize.col('AppliedJob.id')), 'total_entries'],
        [Sequelize.fn('MAX', Sequelize.col('AppliedJob.created_at')), 'last_used'],
      ],
      include: [{ model: User, attributes: ['id', 'firstname', 'email'] }, { model: Profiles, as: 'profile', attributes: ['id', 'name'] }],
      group: ['AppliedJob.userId', 'AppliedJob.profileId', 'User.id', 'profile.id'],
      order: [[Sequelize.fn('MAX', Sequelize.col('AppliedJob.created_at')), 'DESC']],
    });
    console.log('3. Connects: PASS, count=', usage.length);
    passed++;
  } catch (e: any) { console.error('3. Connects: FAIL -', e.message); failed++; }

  // Test 4: HiredJob aggregation (HiredJob.id in col)
  try {
    const agg = await HiredJob.findAll({
      attributes: [[col('appliedJobDetails.platformId'), 'platformId'], [fn('COUNT', col('HiredJob.id')), 'count']],
      include: [{ model: AppliedJob, as: 'appliedJobDetails', required: true, attributes: [] }],
      group: [col('appliedJobDetails.platformId')],
      subQuery: false, raw: true,
    });
    console.log('4. HiredJob agg: PASS, count=', agg.length);
    passed++;
  } catch (e: any) { console.error('4. HiredJob agg: FAIL -', e.message); failed++; }

  // Test 5: Portfolio (created_at ordering)
  try {
    const p = await Portfolio.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'firstname', 'lastname', 'email'] }],
      order: [['created_at', 'DESC']],
    });
    console.log('5. Portfolio: PASS, count=', p.length);
    passed++;
  } catch (e: any) { console.error('5. Portfolio: FAIL -', e.message); failed++; }

  // Test 6: Applied + Job search (`Job`.title literal)
  try {
    const keyword = 'test';
    const r = await AppliedJob.findAll({
      where: { userId: 5, [Op.or]: [
        { manualJobTitle: { [Op.like]: `%${keyword}%` } },
        Sequelize.literal("`Job`.title LIKE '%" + keyword.replace(/'/g, "\\'") + "%'"),
      ]},
      include: [{ model: Job, required: false }],
      limit: 5,
    });
    console.log('6. Applied+Job search: PASS, count=', r.length);
    passed++;
  } catch (e: any) { console.error('6. Applied+Job search: FAIL -', e.message); failed++; }

  // Test 7: Full job-stats query
  try {
    const start = new Date('2026-02-07'); start.setHours(0,0,0,0);
    const end = new Date('2026-02-14'); end.setHours(23,59,59,999);
    const wc: any = { [Op.and]: [{ [Op.or]: [{ applied_at: { [Op.between]: [start, end] } }] }] };
    const platformAgg = await AppliedJob.findAll({
      attributes: ['platformId', [fn('SUM', col('connects_used')), 'connects'], [fn('COUNT', col('id')), 'applied']],
      where: wc, group: ['platformId'], raw: true,
    });
    const totalHired = await HiredJob.count({
      include: [{ model: AppliedJob, as: 'appliedJobDetails', required: true, where: wc, attributes: [] }],
      subQuery: false,
    } as any);
    const hiredAgg = await HiredJob.findAll({
      attributes: [[col('appliedJobDetails.platformId'), 'platformId'], [fn('COUNT', col('HiredJob.id')), 'count']],
      include: [{ model: AppliedJob, as: 'appliedJobDetails', required: true, where: wc, attributes: [] }],
      group: [col('appliedJobDetails.platformId')], subQuery: false, raw: true,
    });
    console.log('7. Full job-stats: PASS, platformAgg=', platformAgg.length, 'hired=', totalHired);
    passed++;
  } catch (e: any) { console.error('7. Full job-stats: FAIL -', e.message); failed++; }

  console.log('\n=== Results:', passed, 'passed,', failed, 'failed ===');
  process.exit(failed > 0 ? 1 : 0);
}

main();
