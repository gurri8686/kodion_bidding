const bcrypt = require('bcryptjs');
const models = require('../models');
const { User } = models;
const { connectDB } = require('../config/db');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

(async function main() {
  try {
    await connectDB();
    const existing = await User.findOne({ where: { email: ADMIN_EMAIL } });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      return process.exit(0);
    }
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = await User.create({
      firstname: 'Admin',
      lastname: 'User',
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
    });
    console.log('Created admin:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
})();
