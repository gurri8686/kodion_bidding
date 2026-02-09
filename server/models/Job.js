const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Job = sequelize.define('Job', {
  jobId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    field: 'jobId'
  },
  scrapeLogId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ScrapeLog', // Should match the table name of the ScrapeLog model
      key: 'id'
    },
    field: 'scrapeLogId'
  },
  title: DataTypes.STRING,
  link: DataTypes.STRING,
  postedTime: {
    type: DataTypes.STRING,
    field: 'postedTime'
  },
  rating: DataTypes.STRING,
  jobType: {
    type: DataTypes.STRING,
    field: 'jobType'
  },
  hourlyRate: {
    type: DataTypes.STRING,
    field: 'hourlyRate'
  },
  fixedPrice: {
    type: DataTypes.STRING,
    field: 'fixedPrice'
  },
  experienceLevel: {
    type: DataTypes.STRING,
    field: 'experienceLevel'
  },
  estimatedDuration: {
    type: DataTypes.STRING,
    field: 'estimatedDuration'
  },
  shortDescription: {
    type: DataTypes.TEXT,
    field: 'shortDescription'
  },
  clientSpent: {
    type: DataTypes.STRING,
    field: 'clientSpent'
  },
  isPaymentVerified: {
    type: DataTypes.BOOLEAN,
    field: 'isPaymentVerified'
  },
  clientLocation: {
    type: DataTypes.STRING,
    field: 'clientLocation'
  },
  proposals: DataTypes.STRING,
  exactDateTime: {
    type: DataTypes.STRING,
    field: 'exactDateTime'
  },
  techStack: {
    type: DataTypes.JSON,
    field: 'techStack'
  },
  selectedTech: {
    type: DataTypes.STRING,
    field: 'selectedTech'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  },
  ignoredJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'ignoredJobs'
  },
  appliedJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'appliedJobs'
  },
  hiredJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'hiredJobs'
  },
}, {
  tableName: 'jobs',
  timestamps: true,
  id: false
});
Job.associate = models => {
  Job.belongsTo(models.ScrapeLog, {
    foreignKey: 'scrapeLogId',
    as: 'scrapeLog',
    onDelete: 'CASCADE',
  });
};

module.exports = Job;
