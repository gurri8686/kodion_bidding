import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Developer extends Model {
  declare developerId: string;
  declare name: string;
  declare email: string;
  declare contact: string;
}

Developer.init({
  developerId: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: DataTypes.STRING,
  contact: DataTypes.STRING,
}, {
  sequelize,
  tableName: 'developers',
  timestamps: true
});

export default Developer;
