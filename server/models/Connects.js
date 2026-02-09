const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ConnectsLog = sequelize.define('ConnectsLog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  profileId: { type: DataTypes.INTEGER, allowNull: false },
  connects_used: { type: DataTypes.INTEGER, allowNull: false },
  applied_job_id: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'connects_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

// // Associations
ConnectsLog.associate = (models) => {
  ConnectsLog.belongsTo(models.User, { foreignKey: 'userId' });
  ConnectsLog.belongsTo(models.Profiles, { foreignKey: 'profileId' });
  ConnectsLog.belongsTo(models.AppliedJob, { foreignKey: 'applied_job_id' });
};

module.exports = ConnectsLog;
