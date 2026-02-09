const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  type: {
    type: DataTypes.ENUM(
      'job_applied',
      'job_hired',
      'job_replied',
      'job_interviewed',
      'job_rejected',
      'target_achieved',
      'target_reminder',
      'connects_low',
      'weekly_summary',
      'new_job_match',
      'system_alert',
      'user_blocked',
      'user_activated'
    ),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data like jobId, platformId, etc.',
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium',
  },
  actionUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'URL to navigate when notification is clicked',
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'Icon name or emoji for the notification',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'notifications',
  timestamps: true,
  updatedAt: false,
  indexes: [
    { fields: ['userId'] },
    { fields: ['isRead'] },
    { fields: ['createdAt'] },
    { fields: ['userId', 'isRead'] },
  ],
});

// Associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
  });
};

module.exports = Notification;
