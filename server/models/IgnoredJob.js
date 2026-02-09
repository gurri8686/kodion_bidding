const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const Job  = require("./Job");
const User  = require('./User');



const IgnoredJob = sequelize.define("IgnoredJob", {
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.BIGINT(20).UNSIGNED, 
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.STRING, // ✅ match the type
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'jobId', // ✅ foreign key will now succeed
    }
  }
}, {
  tableName: 'ignored_jobs',
  timestamps: true,
});

IgnoredJob.associate = models => {
  IgnoredJob.belongsTo(models.Job, {
    foreignKey: "jobId",
    targetKey: "jobId"
  });
  IgnoredJob.belongsTo(models.User, {
    foreignKey: "userId"
  });
};

module.exports = IgnoredJob ;
