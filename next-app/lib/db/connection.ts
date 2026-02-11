/**
 * Database Connection Singleton for Next.js Serverless
 *
 * Creates and reuses a single Sequelize instance across serverless function invocations.
 * This is critical for performance in serverless environments.
 */

import { Sequelize } from 'sequelize';

let sequelizeInstance: Sequelize | null = null;

/**
 * Get or create Sequelize instance
 * Uses singleton pattern to reuse connections across API route invocations
 */
export function getSequelize(): Sequelize {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(
      process.env.MYSQL_DB_NAME || 'dev_bidding_db',
      process.env.MYSQL_DB_USER || 'root',
      process.env.MYSQL_DB_PASSWORD || '',
      {
        host: process.env.MYSQL_DB_HOST || 'localhost',
        port: parseInt(process.env.MYSQL_DB_PORT || '3306'),
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,

        // Connection pool settings optimized for serverless
        pool: {
          max: 5, // Maximum connections
          min: 0, // Minimum connections (0 allows scaling down)
          acquire: 30000, // Maximum time (ms) to get connection before throwing error
          idle: 10000, // Maximum time (ms) connection can be idle before release
        },

        // Retry settings for better reliability
        retry: {
          max: 3,
          timeout: 3000,
        },

        // Only enable SSL if explicitly configured via MYSQL_SSL=true
        dialectOptions:
          process.env.MYSQL_SSL === 'true'
            ? {
                ssl: {
                  require: true,
                  rejectUnauthorized: false,
                },
              }
            : {},
      }
    );

    // Test connection
    sequelizeInstance
      .authenticate()
      .then(() => {
        console.log('✅ MySQL connected successfully');
      })
      .catch((error) => {
        console.error('❌ Unable to connect to MySQL:', error);
      });
  }

  return sequelizeInstance;
}

/**
 * Test database connection
 * Useful for health checks
 */
export async function testConnection(): Promise<boolean> {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Close database connection
 * Useful for graceful shutdown (though rare in serverless)
 */
export async function closeConnection(): Promise<void> {
  if (sequelizeInstance) {
    await sequelizeInstance.close();
    sequelizeInstance = null;
    console.log('🔌 Database connection closed');
  }
}

// Export the instance directly for convenience
export const sequelize = getSequelize();
export default sequelize;
