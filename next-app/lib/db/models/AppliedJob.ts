import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class AppliedJob extends Model {
  declare id: number;
  declare bidderName: string;
  declare profileId: number | null;
  declare profileName: string;
  declare technologies: any;
  declare connectsUsed: number;
  declare proposalLink: string;
  declare appliedAt: Date;
  declare userId: number;
  declare manualJobTitle: string;
  declare manualJobDescription: string;
  declare manualJobUrl: string | null;
  declare jobId: string | null;
  declare platformId: number | null;
  declare replyDate: Date | null;
  declare replyNotes: string | null;
  declare interviewDate: Date | null;
  declare interviewNotes: string | null;
  declare stage: 'applied' | 'replied' | 'interview' | 'hired' | 'not-hired';
  declare notHiredNotes: string | null;
  declare hiredDate: Date | null;
  declare attachments: any;

  static associate(models: any) {
    AppliedJob.belongsTo(models.Job, {
      foreignKey: 'jobId',
      targetKey: 'jobId',
    });

    AppliedJob.belongsTo(models.User, {
      foreignKey: 'userId',
    });

    AppliedJob.belongsTo(models.Profiles, {
      foreignKey: 'profileId',
      targetKey: 'id',
      as: 'profile',
    });

    AppliedJob.hasMany(models.ConnectsLog, {
      foreignKey: 'applied_job_id',
    });

    AppliedJob.belongsTo(models.Platform, {
      foreignKey: 'platformId',
      targetKey: 'id',
      as: 'platform',
    });

    AppliedJob.hasOne(models.HiredJob, {
      foreignKey: 'jobId',
      sourceKey: 'jobId',
    });
  }
}

AppliedJob.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  bidderName: {
    type: DataTypes.STRING,
    field: 'bidder_name',
  },
  profileId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'profileId',
  },
  profileName: {
    type: DataTypes.STRING,
    field: 'profile_name',
  },
  technologies: {
    type: DataTypes.JSONB,
    field: 'technologies',
  },
  connectsUsed: {
    type: DataTypes.INTEGER,
    field: 'connects_used',
  },
  proposalLink: {
    type: DataTypes.STRING,
    field: 'proposal_link',
  },
  appliedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'applied_at',
  },
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
  },
  manualJobTitle: {
    type: DataTypes.STRING,
    field: 'manual_job_title',
  },
  manualJobDescription: {
    type: DataTypes.TEXT,
    field: 'manual_job_description',
  },
  manualJobUrl: {
    type: DataTypes.TEXT,
    field: 'manual_job_url',
    allowNull: true,
  },
  jobId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  platformId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'platformId',
  },
  replyDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'replyDate',
  },
  replyNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'replyNotes',
  },
  interviewDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'interviewDate',
  },
  interviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'interviewNotes',
  },
  stage: {
    type: DataTypes.ENUM(
      'applied',
      'replied',
      'interview',
      'hired',
      'not-hired'
    ),
    allowNull: false,
    defaultValue: 'applied',
    field: 'stage',
  },
  notHiredNotes: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'not_hired_notes',
  },
  hiredDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'hired_date',
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'attachments',
    comment: 'Array of file URLs - e.g., [\'/api/jobs/attachments/file1.pdf\']',
  },
}, {
  sequelize,
  tableName: 'applied_jobs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default AppliedJob;
