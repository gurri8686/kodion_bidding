import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class HiredJob extends Model {
  declare id: number;
  declare jobId: string;
  declare clientName: string;
  declare profileName: string;
  declare bidderId: string | null;
  declare developerId: string | null;
  declare hiredAt: Date;
  declare notes: string | null;
  declare budgetType: 'Hourly' | 'Fixed';
  declare budgetAmount: number;
  declare hiredDate: Date | null;

  static associate(models: any) {
    HiredJob.belongsTo(models.Job, {
      foreignKey: 'jobId',
      targetKey: 'jobId',
      as: 'jobDetails',
    });

    HiredJob.belongsTo(models.Developer, {
      foreignKey: 'developerId',
      targetKey: 'developerId',
      as: 'developerDetails',
    });

    HiredJob.belongsTo(models.AppliedJob, {
      foreignKey: 'jobId',
      targetKey: 'id',
      as: 'appliedJobDetails',
    });
  }
}

HiredJob.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  jobId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  profileName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bidderId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  developerId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  hiredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  budgetType: {
    type: DataTypes.ENUM('Hourly', 'Fixed'),
    allowNull: false,
  },
  budgetAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  hiredDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'hired_date',
  },
}, {
  sequelize,
  tableName: 'hired_jobs',
  timestamps: true,
});

export default HiredJob;
