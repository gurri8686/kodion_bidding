// models/Logs.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Logs = sequelize.define('Logs', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  appliedJobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  // ⭐ Newly added — field-level differences
  changes: {
    type: DataTypes.JSON,
    allowNull: true, // allowNull because for "create" logs you may not have diff
  },

  changeType: {
    type: DataTypes.STRING, // e.g., "edit", "create", "delete"
    allowNull: false,
  } 
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

Logs.associate = models => {
  Logs.belongsTo(models.AppliedJob, {
    foreignKey: 'appliedJobId',
    as: 'appliedJob'
  });
};
module.exports = Logs;
