// models/TechnologyJobCount.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TechnologyJobCount = sequelize.define('TechnologyJobCount', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scrapeLogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  technology: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'TechnologyJobCounts',
  timestamps: true,
});

TechnologyJobCount.associate = (models) => {
  TechnologyJobCount.belongsTo(models.ScrapeLog, {
    foreignKey: 'scrapeLogId',
    as: 'scrapeLog',
  });
};

module.exports = TechnologyJobCount;
