const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Technologies = sequelize.define('Technologies', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  tableName: 'Technologies',
  timestamps: true,
});

Technologies.associate = (models) => {
  Technologies.hasMany(models.Job, {
    foreignKey: 'scrapeLogId',
    sourceKey: 'id',
    as: 'jobs',
  });

  // Many-to-many with User
  Technologies.belongsToMany(models.User, {
    through: models.UserTechnologies,
    foreignKey: 'technologyId',
    otherKey: 'userId',
    as: 'users'
  });
};

module.exports = Technologies;
