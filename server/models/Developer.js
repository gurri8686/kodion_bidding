// models/Developer.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Developer = sequelize.define('Developer', {
  developerId: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: DataTypes.STRING,
  contact: DataTypes.STRING,
//   profileImage: DataTypes.STRING,
//   skills: DataTypes.STRING
}, {
  tableName: 'developers',
  timestamps: true
});

module.exports = Developer;
