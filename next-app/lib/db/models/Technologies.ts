import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Technologies extends Model {
  declare id: number;
  declare name: string;

  static associate(models: any) {
    Technologies.hasMany(models.Job, {
      foreignKey: 'scrapeLogId',
      sourceKey: 'id',
      as: 'jobs',
    });

    // Many-to-many with User
    Technologies.belongsToMany(models.User, {
      through: models.UserTechnologies,
      foreignKey: 'technologyId',
      otherKey: 'userId',
      as: 'users'
    });
  }
}

Technologies.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
}, {
  sequelize,
  tableName: 'Technologies',
  timestamps: true,
});

export default Technologies;
