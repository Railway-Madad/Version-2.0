const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Admin = require('./models/adminModel');
const bcrypt = require('bcryptjs');

async function seed() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('Connected to MongoDB');

  const USERNAME = 'superadmin';
  const PASSWORD = 'password123';
  const hashed = await bcrypt.hash(PASSWORD, 10);

  const existing = await Admin.findOne({ username: USERNAME });
  if (existing) {
    existing.password = hashed;
    existing.trainNo = existing.trainNo || 'ALL';
    await existing.save();
    console.log('Admin updated:', existing.username, 'trainNo:', existing.trainNo);
  } else {
    const admin = await Admin.create({
      username: USERNAME,
      email: 'superadmin@railway.com',
      password: hashed,
      trainNo: 'ALL',
    });
    console.log('Admin created:', admin.username);
  }

  const all = await Admin.find({});
  console.log('All admins in DB:', all.map(a => ({ username: a.username, trainNo: a.trainNo, email: a.email })));
  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(e => { console.error(e); process.exit(1); });
