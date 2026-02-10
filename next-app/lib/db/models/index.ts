import User from './User';
import Job from './Job';
import AppliedJob from './AppliedJob';
import IgnoredJob from './IgnoredJob';
import HiredJob from './HiredJob';
import Technologies from './Technologies';
import UserTechnologies from './UserTechnologies';
import TechnologyJobCount from './TechnologyJobCount';
import Developer from './Developer';
import Platform from './Platform';
import Profiles from './Profiles';
import Portfolio from './Portfolio';
import Notification from './Notification';
import ScrapeLog from './ScrapeLog';
import ConnectsLog from './ConnectsLog';
import WeeklyTargets from './WeeklyTargets';
import Logs from './Logs';

const models = {
  User,
  Job,
  AppliedJob,
  IgnoredJob,
  HiredJob,
  Technologies,
  UserTechnologies,
  TechnologyJobCount,
  Developer,
  Platform,
  Profiles,
  Portfolio,
  Notification,
  ScrapeLog,
  ConnectsLog,
  WeeklyTargets,
  Logs,
};

// Call associate method on each model if it exists
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

export {
  User,
  Job,
  AppliedJob,
  IgnoredJob,
  HiredJob,
  Technologies,
  UserTechnologies,
  TechnologyJobCount,
  Developer,
  Platform,
  Profiles,
  Portfolio,
  Notification,
  ScrapeLog,
  ConnectsLog,
  WeeklyTargets,
  Logs,
};

export default models;
