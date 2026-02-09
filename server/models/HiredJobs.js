const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Job = require("./Job");
const Developer = require("./Developer");
const AppliedJob = require("./Applyjob"); // ✅ ADD THIS

const HiredJob = sequelize.define(
  "HiredJob",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    clientName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    profileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    bidderId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    developerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    hiredAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    budgetType: {
      type: DataTypes.ENUM("Hourly", "Fixed"),
      allowNull: false,
    },
    budgetAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    hiredDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "hired_date",
    },
  },
  {
    tableName: "hired_jobs",
    timestamps: true,
  }
);

// -------------------------
// ⭐ ALL ASSOCIATIONS HERE
// -------------------------

HiredJob.belongsTo(Job, {
  foreignKey: "jobId",
  targetKey: "jobId",
  as: "jobDetails",
});

HiredJob.belongsTo(Developer, {
  foreignKey: "developerId",
  targetKey: "developerId",
  as: "developerDetails",
});

// ⭐ FIX: Apply association directly (NOT inside associate())
// jobId in hired_jobs actually references applied_jobs.id
HiredJob.belongsTo(AppliedJob, {
  foreignKey: "jobId",
  targetKey: "id",
  as: "appliedJobDetails",
});

module.exports = HiredJob;
