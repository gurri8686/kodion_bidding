// Set env vars before dynamic imports
process.env.MYSQL_DB_NAME = 'kodion_bidding';
process.env.MYSQL_DB_USER = 'kodion_bidding';
process.env.MYSQL_DB_PASSWORD = 'godaddy.Kodion@2025';
process.env.MYSQL_DB_HOST = 'sg2plzcpnl509520.prod.sin2.secureserver.net';
process.env.MYSQL_DB_PORT = '3306';

async function main() {
  const { User, Technologies, AppliedJob, Profiles, HiredJob, Portfolio, Platform } = await import('./lib/db/models');
  const { Op, Sequelize, fn, col } = await import('sequelize');

  // Test 2 FIX: User activity query - use User.id instead of users.id
  try {
    const users = await User.findAll({
      where: { role: { [Op.ne]: 'admin' } },
      attributes: [
        'id', 'firstname', 'lastname', 'email', 'joinDate', 'lastActive',
        [Sequelize.literal('(SELECT COUNT(*) FROM applied_jobs AS aj WHERE aj.userId = `User`.id)'), 'appliedJobsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM ignored_jobs AS ij WHERE ij.userId = `User`.id)'), 'ignoredJobsCount'],
        [Sequelize.literal('(SELECT COUNT(*) FROM hired_jobs AS hj WHERE hj.bidderId = `User`.id)'), 'hiredJobsCount'],
      ],
      include: [{
        model: Technologies,
        as: 'technologies',
        through: { attributes: [] },
        attributes: ['name'],
      }],
    });
    console.log('2. User activity: OK, count=', users.length);
  } catch (e: any) {
    console.error('2. Activity ERROR:', e.message);
  }

  // Test 3 FIX: Connects query - use AppliedJob alias
  try {
    const usage = await AppliedJob.findAll({
      attributes: [
        'userId', 'profileId',
        [Sequelize.fn('SUM', Sequelize.col('AppliedJob.connects_used')), 'total_connects'],
        [Sequelize.fn('COUNT', Sequelize.col('AppliedJob.id')), 'total_entries'],
        [Sequelize.fn('MAX', Sequelize.col('AppliedJob.created_at')), 'last_used'],
      ],
      include: [
        { model: User, attributes: ['id', 'firstname', 'email'] },
        { model: Profiles, as: 'profile', attributes: ['id', 'name'] },
      ],
      group: ['AppliedJob.userId', 'AppliedJob.profileId', 'User.id', 'profile.id'],
      order: [[Sequelize.fn('MAX', Sequelize.col('AppliedJob.created_at')), 'DESC']],
    });
    console.log('3. Connects: OK, count=', usage.length);
  } catch (e: any) {
    console.error('3. Connects ERROR:', e.message);
  }

  // Test 4 FIX: Job stats aggregation - use HiredJob alias
  try {
    const hiredPlatformAgg = await HiredJob.findAll({
      attributes: [
        [col('appliedJobDetails.platformId'), 'platformId'],
        [fn('COUNT', col('HiredJob.id')), 'count'],
      ],
      include: [{
        model: AppliedJob,
        as: 'appliedJobDetails',
        required: true,
        attributes: [],
      }],
      group: [col('appliedJobDetails.platformId')],
      subQuery: false,
      raw: true,
    });
    console.log('4. HiredJob agg: OK, count=', hiredPlatformAgg.length);
  } catch (e: any) {
    console.error('4. JobStats ERROR:', e.message);
  }

  // Test 5 FIX: Portfolio - use created_at attribute name
  try {
    const portfolios = await Portfolio.findAll({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstname', 'lastname', 'email'],
      }],
      order: [['created_at', 'DESC']],
    });
    console.log('5. Portfolio: OK, count=', portfolios.length);
  } catch (e: any) {
    console.error('5. Portfolio ERROR:', e.message);
  }

  process.exit(0);
}

main();
