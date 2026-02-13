import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Logs extends Model {
  declare id: number;
  declare appliedJobId: number;
  declare changedByUserId: number;
  declare oldData: any;
  declare newData: any;
  declare changes: any | null;
  declare changeType: string;

  static associate(models: any) {
    Logs.belongsTo(models.AppliedJob, {
      foreignKey: 'appliedJobId',
      as: 'appliedJob'
    });
  }
}

Logs.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  appliedJobId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  changedByUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  newData: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  changeType: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'Logs',
  tableName: 'logs',
  timestamps: true,
});

export default Logs;
