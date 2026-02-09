// models/UserTechnologies.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Technologies = require('./Technologies'); // Adjust the path as necessary
const UserTechnologies = sequelize.define('UserTechnologies', {
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
    tableName: 'user_technologies',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['userId', 'technologyId']  // prevent duplicate entries
        }
    ]
});
UserTechnologies.belongsTo(Technologies, {
  foreignKey: 'technologyId',
  as: 'technology'
});

module.exports = UserTechnologies;
