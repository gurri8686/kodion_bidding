/**
 * Migration script to add attachments column to applied_jobs table
 * Run this once with: node migrate-attachments.js
 */

const { sequelize } = require('./config/db');

async function addAttachmentsColumn() {
  try {
    console.log('🔄 Adding attachments column to applied_jobs table...');

    await sequelize.query(`
      ALTER TABLE applied_jobs
      ADD COLUMN attachments JSON DEFAULT NULL
      COMMENT 'Stores array of file attachment metadata (filename, originalName, size, mimetype, path)'
    `);

    console.log('✅ Successfully added attachments column!');

    // Verify the column was added
    const [results] = await sequelize.query('DESCRIBE applied_jobs');
    console.log('\n📋 Table structure:');
    console.table(results);

    process.exit(0);
  } catch (error) {
    if (error.original && error.original.errno === 1060) {
      console.log('⚠️  Column "attachments" already exists!');
      process.exit(0);
    } else {
      console.error('❌ Error adding column:', error.message);
      process.exit(1);
    }
  }
}

// Connect to database and run migration
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected');
    return addAttachmentsColumn();
  })
  .catch(err => {
    console.error('❌ Unable to connect to database:', err);
    process.exit(1);
  });
