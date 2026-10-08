const path = require('node:path');
const fs = require('node:fs/promises');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
if (process.env.DNS_SERVERS) require('node:dns').setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean));
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const cloudinary = require('../src/config/cloudinary');
const { profiles, password, seedBatch } = require('./demoProfiles');
const root = path.resolve(__dirname, '../..');
const artifacts = path.join(root, 'artifacts');

async function seed() {
  for (const key of ['MONGO_URI', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET']) {
    if (!process.env[key]) throw new Error(`Missing ${key}`);
  }
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000, connectTimeoutMS: 10000 });
  const collisions = await User.find({ email: { $in: profiles.map(p => p.email) }, seedBatch: { $ne: seedBatch } }).select('email').lean();
  if (collisions.length) throw new Error(`Existing non-demo accounts would be overwritten: ${collisions.map(u => u.email).join(', ')}`);
  await fs.mkdir(path.join(artifacts, 'portraits'), { recursive: true });
  const accounts = [];
  for (const [index, person] of profiles.entries()) {
    const { localPhoto, photoSource, name, email, ...profileData } = person;
    let photoPath;
    if (localPhoto) {
      photoPath = path.join(root, 'mobile/Profiles', localPhoto);
    } else {
      photoPath = path.join(artifacts, 'portraits', `${email.split('@')[0]}.jpg`);
      const response = await fetch(photoSource, { signal: AbortSignal.timeout(30000) });
      if (!response.ok || !response.headers.get('content-type')?.startsWith('image/')) throw new Error(`Portrait download failed for ${name}`);
      await fs.writeFile(photoPath, Buffer.from(await response.arrayBuffer()));
    }
    const publicId = `roomiematch/demo/${email.split('@')[0]}`;
    const image = await cloudinary.uploader.upload(photoPath, {
      public_id: publicId,
      overwrite: false,
      resource_type: 'image',
      transformation: [{ width: 800, height: 1000, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
    });
    const user = await User.findOneAndUpdate({ email }, {
      name, email, password: await bcrypt.hash(password, 12), isDemo: true, seedBatch,
    }, { upsert: true, new: true, runValidators: true });
    const profile = await Profile.findOneAndUpdate({ userId: user._id }, {
      ...profileData, userId: user._id, photo: image.secure_url, isDemo: true, seedBatch,
    }, { upsert: true, new: true, runValidators: true });
    accounts.push({ name, email, password, city: person.city, state: person.state, country: person.country, budget: person.budget, userId: String(user._id), profileId: String(profile._id), photo: image.secure_url, photoSource });
    // Write after every successful account so interrupted runs still have a reviewable record.
    await fs.writeFile(path.join(artifacts, 'demo-accounts.json'), JSON.stringify(accounts, null, 2));
    console.log(`${index + 1}/${profiles.length}: ${name} (${person.city}, ${person.state})`);
  }
  const columns = ['name', 'email', 'password', 'city', 'state', 'country', 'budget', 'photo'];
  const csv = [columns.join(','), ...accounts.map(a => columns.map(k => `"${String(a[k]).replaceAll('"', '""')}"`).join(','))].join('\n');
  await fs.writeFile(path.join(artifacts, 'demo-accounts.csv'), csv + '\n');
  console.log(`Seeded ${accounts.length} demo users and profiles into ${mongoose.connection.name}. Credentials: artifacts/demo-accounts.csv`);
}
seed().catch(err => { console.error('Demo seed failed:', err.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());
