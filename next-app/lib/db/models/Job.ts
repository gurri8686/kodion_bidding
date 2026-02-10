import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class Job extends Model {
  declare jobId: string;
  declare scrapeLogId: number | null;
  declare title: string;
  declare link: string;
  declare postedTime: string;
  declare rating: string;
  declare jobType: string;
  declare hourlyRate: string;
  declare fixedPrice: string;
  declare experienceLevel: string;
  declare estimatedDuration: string;
  declare shortDescription: string;
  declare clientSpent: string;
  declare isPaymentVerified: boolean;
  declare clientLocation: string;
  declare proposals: string;
  declare exactDateTime: string;
  declare techStack: any;
  declare selectedTech: string;
  declare createdAt: Date;
  declare updatedAt: Date;
  declare ignoredJobs: boolean;
  declare appliedJobs: boolean;
  declare hiredJobs: boolean;

  static associate(models: any) {
    Job.belongsTo(models.ScrapeLog, {
      foreignKey: 'scrapeLogId',
      as: 'scrapeLog',
      onDelete: 'CASCADE',
    });
  }
}

Job.init({
  jobId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    primaryKey: true,
    field: 'jobId'
  },
  scrapeLogId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'ScrapeLog',
      key: 'id'
    },
    field: 'scrapeLogId'
  },
  title: DataTypes.STRING,
  link: DataTypes.STRING,
  postedTime: {
    type: DataTypes.STRING,
    field: 'postedTime'
  },
  rating: DataTypes.STRING,
  jobType: {
    type: DataTypes.STRING,
    field: 'jobType'
  },
  hourlyRate: {
    type: DataTypes.STRING,
    field: 'hourlyRate'
  },
  fixedPrice: {
    type: DataTypes.STRING,
    field: 'fixedPrice'
  },
  experienceLevel: {
    type: DataTypes.STRING,
    field: 'experienceLevel'
  },
  estimatedDuration: {
    type: DataTypes.STRING,
    field: 'estimatedDuration'
  },
  shortDescription: {
    type: DataTypes.TEXT,
    field: 'shortDescription'
  },
  clientSpent: {
    type: DataTypes.STRING,
    field: 'clientSpent'
  },
  isPaymentVerified: {
    type: DataTypes.BOOLEAN,
    field: 'isPaymentVerified'
  },
  clientLocation: {
    type: DataTypes.STRING,
    field: 'clientLocation'
  },
  proposals: DataTypes.STRING,
  exactDateTime: {
    type: DataTypes.STRING,
    field: 'exactDateTime'
  },
  techStack: {
    type: DataTypes.JSON,
    field: 'techStack'
  },
  selectedTech: {
    type: DataTypes.STRING,
    field: 'selectedTech'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  },
  ignoredJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'ignoredJobs'
  },
  appliedJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'appliedJobs'
  },
  hiredJobs: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'hiredJobs'
  },
}, {
  sequelize,
  tableName: 'jobs',
  timestamps: true,
  id: false
});

export default Job;
