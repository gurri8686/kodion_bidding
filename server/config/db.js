const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create MySQL connection
const sequelize = new Sequelize(
    process.env.MYSQL_DB_NAME,
    process.env.MYSQL_DB_USER,
    process.env.MYSQL_DB_PASSWORD,
    {
        host: process.env.MYSQL_DB_HOST,
        dialect: 'mysql',
        port: process.env.MYSQL_DB_PORT || 3306,
        logging: false, // disable logging for cleaner console
    }
);

// Connect function
const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log(`Connected to MySQL database: ${process.env.MYSQL_DB_NAME}`);
    } catch (err) {
        console.error('MySQL connection failed:', err.message || err);
        process.exit(1); // stop server on DB error
    }
};

module.exports = { sequelize, connectDB };
