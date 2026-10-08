const path = require('node:path');
const assert = require('node:assert/strict');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
if (process.env.DNS_SERVERS) require('node:dns').setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean));
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const { seedBatch, profiles, password } = require('./demoProfiles');

async function verify() {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  const users = await User.find({ seedBatch }).lean();
  assert.equal(users.length, profiles.length);
  const records = await Profile.find({ seedBatch }).lean();
  assert.equal(records.length, profiles.length);
  for (const expected of profiles) {
    const user = users.find(u => u.email === expected.email);
    assert(user, `Missing ${expected.email}`);
    assert(await bcrypt.compare(password, user.password), `Incorrect password for ${expected.email}`);
    assert.notEqual(user.password, password);
    const profile = records.find(p => String(p.userId) === String(user._id));
    assert(profile, `Missing profile for ${expected.email}`);
    assert.equal(profile.country, 'United States');
    assert.equal(profile.city, expected.city);
    assert.equal(profile.lookingFor, 'roommate');
    assert(profile.isDemo);
    assert(profile.photo.startsWith('https://res.cloudinary.com/'));
    const response = await fetch(profile.photo, { method: 'HEAD', signal: AbortSignal.timeout(15000) });
    assert(response.ok, `Photo unavailable for ${expected.email}`);
  }
  console.log(`Verified ${users.length} accounts: exact passwords, bcrypt hashes, US locations, linked profiles, and accessible Cloudinary photos.`);
}
verify().catch(err => { console.error('Verification failed:', err.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
