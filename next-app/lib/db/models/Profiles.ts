import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Profiles extends Model {
  declare id: string;
  declare name: string;

  static associate(models: any) {
    Profiles.hasMany(models.AppliedJob, {
      foreignKey: 'profileId',
      sourceKey: 'id'
    });
  }
}

Profiles.init({
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
}, {
  sequelize,
  modelName: 'Profiles',
  tableName: 'profiles',
  timestamps: true
});

export default Profiles;
