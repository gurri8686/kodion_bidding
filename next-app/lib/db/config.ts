import { Sequelize } from 'sequelize';

// Create MySQL connection using environment variables
const sequelize = new Sequelize(
  process.env.MYSQL_DB_NAME || 'kodion_bidding',
  process.env.MYSQL_DB_USER || 'kodion_bidding',
  process.env.MYSQL_DB_PASSWORD || '',
  {
    host: process.env.MYSQL_DB_HOST || '118.139.180.250',
    dialect: 'mysql',
    port: parseInt(process.env.MYSQL_DB_PORT || '3306', 10),
    logging: false, // disable logging for cleaner console
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false
    }
  }
);

/**
 * Test database connection
 */
export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log(`✓ Connected to MySQL database: ${process.env.MYSQL_DB_NAME}`);
    return true;
  } catch (err) {
    console.error('✗ MySQL connection failed:', err);
    return false;
  }
}

/**
 * Sync database models
 */
export async function syncDB() {
  try {
    await sequelize.sync({ alter: false }); // Set to true only in development if you want auto-migrations
    console.log('✓ Database models synced');
  } catch (err) {
    console.error('✗ Database sync failed:', err);
  }
}

export { sequelize };
export default sequelize;
