const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Platform = sequelize.define(
  'Platform',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    connect_cost_usd: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },

    connect_cost_inr: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
  },
  {
    timestamps: true,
  }
);

// Association
Platform.associate = models => {
  Platform.hasMany(models.AppliedJob, {
    foreignKey: "platformId"
  });
};

module.exports = Platform;
