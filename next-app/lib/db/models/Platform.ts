import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Platform extends Model {
  declare id: number;
  declare name: string;
  declare connect_cost_usd: number | null;
  declare connect_cost_inr: number | null;

  static associate(models: any) {
    Platform.hasMany(models.AppliedJob, {
      foreignKey: 'platformId'
    });
  }
}

Platform.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  connect_cost_usd: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  connect_cost_inr: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
}, {
  sequelize,
  modelName: 'Platform',
  tableName: 'platforms',
  timestamps: true,
});

export default Platform;
