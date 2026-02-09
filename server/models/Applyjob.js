const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AppliedJob = sequelize.define(
  "AppliedJob",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bidderName: {
      type: DataTypes.STRING,
      field: "bidder_name",
    },
    profileId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "profileId",
    },
    profileName: {
      type: DataTypes.STRING,
      field: "profile_name",
    },
    technologies: {
      type: DataTypes.JSONB,
      field: "technologies",
    },
    connectsUsed: {
      type: DataTypes.INTEGER,
      field: "connects_used",
    },
    proposalLink: {
      type: DataTypes.STRING,
      field: "proposal_link",
    },
    appliedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: "applied_at",
    },
    userId: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
    manualJobTitle: {
      type: DataTypes.STRING,
      field: "manual_job_title",
    },
    manualJobDescription: {
      type: DataTypes.TEXT,
      field: "manual_job_description",
    },
    manualJobUrl: {
      type: DataTypes.TEXT,
      field: "manual_job_url",
      allowNull: true,
    },
    jobId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    platformId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "platformId",
    },
    // // New columns
    // stage: {
    //   type: DataTypes.STRING(20),
    //   allowNull: false,
    //   defaultValue: 'applied',
    //   field: 'stage',
    // },
    replyDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "replyDate",
    },
    replyNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "replyNotes",
    },
    interviewDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "interviewDate",
    },
    interviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "interviewNotes",
    },
    stage: {
      type: DataTypes.ENUM(
        "applied",
        "replied",
        "interview",
        "hired",
        "not-hired"
      ),
      allowNull: false,
      defaultValue: "applied",
      field: "stage",
    },
    notHiredNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "not_hired_notes", // ✅ snake_case
    },
    hiredDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "hired_date",
    },
    attachments: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
      field: "attachments",
      comment: "Array of file URLs - e.g., ['/api/jobs/attachments/file1.pdf']",
    },
  },
  {
    tableName: "applied_jobs",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

// 🔥 ALL ASSOCIATIONS HERE — single place only
AppliedJob.associate = (models) => {
  AppliedJob.belongsTo(models.Job, {
    foreignKey: "jobId",
    targetKey: "jobId",
  });

  AppliedJob.belongsTo(models.User, {
    foreignKey: "userId",
  });

  AppliedJob.belongsTo(models.Profiles, {
    foreignKey: "profileId",
    targetKey: "id",
    as: "profile",
  });

  AppliedJob.hasMany(models.ConnectsLog, {
    foreignKey: "applied_job_id",
  });

  // ⭐ FIX — correct Platform association
  AppliedJob.belongsTo(models.Platform, {
    foreignKey: "platformId",
    targetKey: "id",
    as: "platform",
  });

  AppliedJob.hasOne(models.HiredJob, {
    foreignKey: "jobId",
    sourceKey: "jobId",
  });
};

module.exports = AppliedJob;
