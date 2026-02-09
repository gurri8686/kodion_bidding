// Migration to update notifications table to support emojis
const { sequelize } = require('../config/db');

async function updateNotificationsCharset() {
  try {
    console.log('🔧 Updating notifications table to support emojis...');

    // Update icon column to use utf8mb4
    await sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN icon VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    // Also update title and message columns to support emojis
    await sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN title VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    await sequelize.query(`
      ALTER TABLE notifications
      MODIFY COLUMN message TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);

    console.log('✅ Notifications table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating table:', error);
    process.exit(1);
  }
}

updateNotificationsCharset();
