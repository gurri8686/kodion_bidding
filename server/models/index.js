const Job = require('./Job');
const User = require('./User');
const IgnoredJob = require('./IgnoredJob');
const HiredJob = require('./HiredJobs');
const ScrapeLog = require('./ScrapeLog');
const AppliedJob = require('./Applyjob');
const Profiles = require('./Profiles');
const Technologies = require('./Technologies');
const UserTechnologies = require('./UserTechnologies');
const TechnologyJobCount = require('./TechnologyJobCount');
const Developer = require('./Developer');
const Platform = require('./Platform');
const ConnectsLog = require('./Connects');
const WeeklyTargets = require('./WeeklyTargets');
const Logs = require('./Logs');
const Notification = require('./Notification');
const Portfolio = require('./Portfolio');

const models = {
  Job,
  User,
  AppliedJob,
  IgnoredJob,
  ScrapeLog,
  Technologies,
  UserTechnologies,
  TechnologyJobCount,
  HiredJob,
  Developer,
  Profiles,
  ConnectsLog,
  Logs,
  Platform,
  WeeklyTargets,
  Notification,
  Portfolio
};

// 🔥 Load all associations automatically
Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = models;
