const models = require('../models');
const { User } = models;
const { connectDB } = require('../config/db');

(async function main() {
  try {
    await connectDB();
    const users = await User.findAll({ raw: true });
    console.log('Users:', users);
  } catch (err) {
    console.error('Error listing users:', err);
    process.exit(1);
  }
})();
