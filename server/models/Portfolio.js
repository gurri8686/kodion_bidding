const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Portfolio = sequelize.define('Portfolio', {
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

// Define associations
Portfolio.associate = (models) => {
  Portfolio.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user',
    onDelete: 'CASCADE'
  });
};

module.exports = Portfolio;
