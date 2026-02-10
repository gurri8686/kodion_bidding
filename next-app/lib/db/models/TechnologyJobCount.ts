import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class TechnologyJobCount extends Model {
  declare id: number;
  declare scrapeLogId: number;
  declare technology: string;
  declare count: number;

  static associate(models: any) {
    TechnologyJobCount.belongsTo(models.ScrapeLog, {
      foreignKey: 'scrapeLogId',
      as: 'scrapeLog',
    });
  }
}

TechnologyJobCount.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  scrapeLogId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  technology: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  sequelize,
  tableName: 'TechnologyJobCounts',
  timestamps: true,
});

export default TechnologyJobCount;
