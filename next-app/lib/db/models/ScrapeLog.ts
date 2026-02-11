import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class ScrapeLog extends Model {
  declare id: number;
  declare jobCount: number;
  declare scrapedAt: Date;

  static associate(models: any) {
    ScrapeLog.hasMany(models.Job, {
      foreignKey: 'scrapeLogId',
      as: 'jobs',
    });

    ScrapeLog.hasMany(models.TechnologyJobCount, {
      foreignKey: 'scrapeLogId',
      as: 'techCounts',
    });
  }
}

ScrapeLog.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  jobCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  scrapedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  tableName: 'ScrapeLogs',
  timestamps: true,
});

export default ScrapeLog;
