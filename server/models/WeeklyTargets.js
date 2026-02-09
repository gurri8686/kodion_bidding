// models/WeeklyTargets.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");
const  User  = require("./User");
const WeeklyTargets = sequelize.define(
  "WeeklyTargets",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    week_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    week_end: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    target_amount : {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    achieved_amount : {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // will update by backend auto calculation
    },
  },
  {
    tableName: "weekly_targets",
    timestamps: true, // adds created_at and updated_at
  }
);
User.hasMany(WeeklyTargets, { foreignKey: "userId" });


// Association
WeeklyTargets.associate = (models) => {
  WeeklyTargets.belongsTo(models.User, { foreignKey: "userId" });
  models.User.hasMany(WeeklyTargets, { foreignKey: "userId" });
};

module.exports = WeeklyTargets;
