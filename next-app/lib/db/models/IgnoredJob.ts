import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class IgnoredJob extends Model {
  declare reason: string;
  declare customReason: string | null;
  declare userId: number;
  declare jobId: string;

  static associate(models: any) {
    IgnoredJob.belongsTo(models.Job, {
      foreignKey: 'jobId',
      targetKey: 'jobId'
    });
    IgnoredJob.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  }
}

IgnoredJob.init({
  reason: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  customReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  jobId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: 'jobs',
      key: 'jobId',
    }
  }
}, {
  sequelize,
  modelName: 'IgnoredJob',
  tableName: 'ignored_jobs',
  timestamps: true,
});

export default IgnoredJob;
