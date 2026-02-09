const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    defaultValue: 'user'
  },
  joinDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  status: {
  type: DataTypes.ENUM('active', 'blocked'),
  defaultValue: 'active'
},
  lastActive: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: false
});

// Associations are defined in a separate setup function
User.associate = (models) => {
  // Ignored jobs
  User.hasMany(models.IgnoredJob, {
    foreignKey: 'userId',
    as: 'ignoredJobs'
  });

  // Applied jobs
  User.hasMany(models.AppliedJob, {
    foreignKey: 'userId',
    as: 'appliedJobs'
  });

  // Many-to-many with Technologies
  User.belongsToMany(models.Technologies, {
    through: models.UserTechnologies,
    foreignKey: 'userId',
    otherKey: 'technologyId',
    as: 'technologies'
  });

  // Notifications
  User.hasMany(models.Notification, {
    foreignKey: 'userId',
    as: 'notifications'
  });
};


module.exports = User;
