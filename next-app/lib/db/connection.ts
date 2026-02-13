/**
 * Database Connection Singleton for Next.js Serverless (Vercel Safe)
 *
 * Optimized for:
 * - Next.js App Router
 * - Vercel Serverless Functions
 * - Remote MySQL (GoDaddy / Cloud DB)
 */

import { Sequelize } from 'sequelize';

declare global {
  // Prevent multiple instances in development / serverless
  // eslint-disable-next-line no-var
  var __sequelize: Sequelize | undefined;
}

/**
 * Create Sequelize instance
 */
function createSequelizeInstance(): Sequelize {
  return new Sequelize(
    process.env.MYSQL_DB_NAME!,
    process.env.MYSQL_DB_USER!,
    process.env.MYSQL_DB_PASSWORD!,
    {
      host: process.env.MYSQL_DB_HOST!,
      port: Number(process.env.MYSQL_DB_PORT || 3306),
      dialect: 'mysql',

      logging:
        process.env.NODE_ENV === 'development' ? console.log : false,

      // ⚡ Important for serverless
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },

      retry: {
        max: 3,
      },

      dialectOptions: {
        connectTimeout: 10000,
      },
    }
  );
}

/**
 * Get singleton Sequelize instance
 */
export function getSequelize(): Sequelize {
  if (!global.__sequelize) {
    global.__sequelize = createSequelizeInstance();
  }

  return global.__sequelize;
}

/**
 * Export singleton instance
 */
export const sequelize = getSequelize();
export default sequelize;

/**
 * Test DB connection manually (for health route)
 */
export async function testConnection(): Promise<boolean> {
  try {
    const sequelize = getSequelize();
    await sequelize.authenticate();
    console.log(' Database connected successfully');
    return true;
  } catch (error) {
    console.error(' Database connection failed:', error);
    return false;
  }
}

/**
 * Close connection (rarely used in serverless)
 */
export async function closeConnection(): Promise<void> {
  if (global.__sequelize) {
    await global.__sequelize.close();
    global.__sequelize = undefined;
    console.log('🔌 Database connection closed');
  }
}
