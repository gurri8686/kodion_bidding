import { DataTypes, Model } from 'sequelize';
import sequelize from '../config';

class UserTechnologies extends Model {
  declare userId: number;
  declare technologyId: number;
  declare is_active: boolean;

  static associate(models: any) {
    UserTechnologies.belongsTo(models.Technologies, {
      foreignKey: 'technologyId',
      as: 'technology'
    });
  }
}

UserTechnologies.init({
  userId: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  technologyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Technologies',
      key: 'id'
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  sequelize,
  tableName: 'user_technologies',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'technologyId']
    }
  ]
});

export default UserTechnologies;
