import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class ConnectsLog extends Model {
  declare id: number;
  declare userId: number;
  declare profileId: number;
  declare connects_used: number;
  declare applied_job_id: number | null;
  declare created_at: Date;

  static associate(models: any) {
    ConnectsLog.belongsTo(models.User, { foreignKey: 'userId' });
    ConnectsLog.belongsTo(models.Profiles, { foreignKey: 'profileId' });
    ConnectsLog.belongsTo(models.AppliedJob, { foreignKey: 'applied_job_id' });
  }
}

ConnectsLog.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  userId: { type: DataTypes.INTEGER, allowNull: false },
  profileId: { type: DataTypes.INTEGER, allowNull: false },
  connects_used: { type: DataTypes.INTEGER, allowNull: false },
  applied_job_id: { type: DataTypes.INTEGER, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  sequelize,
  tableName: 'connects_log',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  underscored: true
});

export default ConnectsLog;
