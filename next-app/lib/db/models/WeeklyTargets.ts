import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class WeeklyTargets extends Model {
  declare id: number;
  declare userId: number;
  declare week_start: string;
  declare week_end: string;
  declare target_amount: number;
  declare achieved_amount: number;

  static associate(models: any) {
    WeeklyTargets.belongsTo(models.User, { foreignKey: 'userId' });
    models.User.hasMany(WeeklyTargets, { foreignKey: 'userId' });
  }
}

WeeklyTargets.init({
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
  target_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  achieved_amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'weekly_targets',
  timestamps: true,
});

export default WeeklyTargets;
