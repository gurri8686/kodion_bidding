// models/ScrapeLog.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ScrapeLog = sequelize.define('ScrapeLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'ScrapeLogs',
  timestamps: true,
});
ScrapeLog.associate = (models) => {
  ScrapeLog.hasMany(models.Job, {
    foreignKey: 'scrapeLogId',
    as: 'jobs',
  });

  ScrapeLog.hasMany(models.TechnologyJobCount, {
    foreignKey: 'scrapeLogId',
    as: 'techCounts',
  });
};
module.exports = ScrapeLog;
