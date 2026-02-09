// models/Developer.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const AppliedJobs = require('./Applyjob'); // <-- Import the model

const Profiles = sequelize.define('Profiles', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  tableName: 'Profiles',
  timestamps: true
});

// Association
Profiles.hasMany(AppliedJobs, {
  foreignKey: 'profileId',
  sourceKey: 'id'
});

module.exports = Profiles;
