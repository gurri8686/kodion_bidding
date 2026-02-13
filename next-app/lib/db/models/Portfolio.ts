import { DataTypes, Model } from 'sequelize';
import sequelize from '../connection';

class Portfolio extends Model {
  declare id: number;
  declare user_id: number;
  declare portfolio_url: string;
  declare technologies: any;
  declare display_order: number;
  declare created_at: Date;
  declare updated_at: Date;

  static associate(models: any) {
    Portfolio.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
      onDelete: 'CASCADE'
    });
  }
}

Portfolio.init({
  id: {
    type: DataTypes.BIGINT.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.BIGINT.UNSIGNED,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  portfolio_url: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  technologies: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of technology names, e.g., ["React", "Node.js", "MongoDB"]'
  },
  display_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'For custom sorting of portfolios'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  sequelize,
  modelName: 'Portfolio',
  tableName: 'portfolios',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      name: 'idx_user_id',
      fields: ['user_id']
    },
    {
      name: 'idx_display_order',
      fields: ['display_order']
    }
  ]
});

export default Portfolio;
