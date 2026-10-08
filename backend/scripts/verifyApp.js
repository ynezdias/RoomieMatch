const path = require('node:path');
const assert = require('node:assert/strict');
const fs = require('node:fs');
require('dotenv').config({ path: path.join(__dirname, '../.env'), quiet: true });
if (process.env.DNS_SERVERS) require('node:dns').setServers(process.env.DNS_SERVERS.split(',').map(s => s.trim()).filter(Boolean));
const mongoose = require('mongoose');
const { io } = require('../../mobile/node_modules/socket.io-client');
const User = require('../src/models/User');
const Profile = require('../src/models/Profile');
const Swipe = require('../src/models/Swipe');
const Match = require('../src/models/Match');
const Message = require('../src/models/Message');
const cloudinary = require('../src/config/cloudinary');
const { profiles, password } = require('./demoProfiles');
const base = process.env.VERIFY_API_URL || 'http://localhost:5000';
const accounts = [], sockets = [], uploaded = [];

async function request(route, { method = 'GET', body, token, status = 200 } = {}) {
  const response = await fetch(base + route, {
    method,
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(20000),
  });
  const data = await response.json();
  assert.equal(response.status, status, `${route}: ${JSON.stringify(data)}`);
  return data;
}
function event(socket, name) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { socket.off(name, listener); reject(new Error(`Timed out waiting for ${name}`)); }, 10000);
    const listener = value => { clearTimeout(timeout); resolve(value); };
    socket.once(name, listener);
  });
}
async function connect(token, matchId) {
  const socket = io(base, { auth: { token }, transports: ['websocket'], autoConnect: false });
  sockets.push(socket);
  const connected = event(socket, 'connect');
  socket.connect();
  await connected;
  const joined = await new Promise((resolve, reject) => socket.timeout(10000).emit('joinMatch', matchId, (err, value) => err ? reject(err) : resolve(value)));
  assert(joined.ok);
  return socket;
}
async function verify() {
  const health = await request('/health');
  assert.equal(health.database, 'connected');
  await request('/api/profile/explore', { status: 401 });
  for (const person of profiles) {
    const data = await request('/api/auth/login', { method: 'POST', body: { email: person.email, password } });
    assert(data.token && data.user._id === data.user.id);
    assert(!data.user.password);
  }
  console.log('PASS: all 30 demo accounts log in through the API.');
  await request('/api/auth/register', { method: 'POST', body: {}, status: 400 });
  const run = Date.now();
  for (let i = 0; i < 3; i++) {
    const email = `verification-${run}-${i}@example.invalid`;
    const data = await request('/api/auth/register', { method: 'POST', body: { name: `Temporary Verification ${i}`, email, password: 'verification-only-password' } });
    accounts.push(data);
  }
  const [a, b, outsider] = accounts;
  const suggestions = await request('/api/swipe/suggestions', { token: a.token });
  assert(suggestions.filter(p => p.seedBatch === 'us-roommates-v1').length === 30);
  const explore = await request('/api/profile/explore', { token: a.token });
  assert(explore.filter(p => p.seedBatch === 'us-roommates-v1').length === 30);
  assert(explore.every(p => !p.userId?.password));
  await request('/api/profile', { method: 'PUT', token: a.token, body: { city: 'Boston', state: 'MA', country: 'United States', university: 'Boston University', aboutMe: 'Temporary integration verification', budget: 1200 } });
  assert.equal((await request('/api/profile/me', { token: a.token })).city, 'Boston');
  const me = await request('/api/users/me', { token: a.token });
  assert(!me.password);
  const form = new FormData();
  form.append('file', new Blob([fs.readFileSync(path.join(__dirname, '../../mobile/Profiles/man-portrait.jpg'))], { type: 'image/jpeg' }), 'verification.jpg');
  const uploadResponse = await fetch(base + '/api/upload', { method: 'POST', headers: { authorization: `Bearer ${a.token}` }, body: form, signal: AbortSignal.timeout(30000) });
  assert.equal(uploadResponse.status, 200);
  const photo = await uploadResponse.json();
  uploaded.push(photo.filename);
  assert(photo.url.startsWith('https://res.cloudinary.com/'));
  console.log('PASS: registration, Explore, suggestions, profile save, upload, and password privacy.');
  await request('/api/swipe', { method: 'POST', token: a.token, body: { targetUserId: suggestions[0]._id, direction: 'right' }, status: 404 });
  await request('/api/swipe', { method: 'POST', token: a.token, body: { targetUserId: b.user.id, direction: 'right' } });
  const result = await request('/api/swipe', { method: 'POST', token: b.token, body: { targetUserId: a.user.id, direction: 'right' } });
  assert(result.match && result.matchId);
  const matchId = result.matchId;
  await request(`/api/chat/${matchId}`, { token: outsider.token, status: 403 });
  await request(`/api/chat/pin/${matchId}`, { method: 'PUT', token: outsider.token, status: 403 });
  await request(`/api/chat/match/${matchId}`, { token: outsider.token, status: 403 });
  const socketA = await connect(a.token, matchId), socketB = await connect(b.token, matchId);
  const received = event(socketB, 'newMessage');
  socketA.emit('sendMessage', { matchId, text: 'Temporary verification message', type: 'text' });
  const message = await received;
  assert.equal(message.text, 'Temporary verification message');
  const messages = await request(`/api/chat/${matchId}`, { token: b.token });
  assert(messages.some(m => m._id === message._id));
  console.log('PASS: mutual matching, authorized chat access, real-time delivery, and persisted messages.');
}
async function cleanup() {
  sockets.forEach(socket => socket.disconnect());
  if (accounts.length) {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    const ids = accounts.map(a => a.user.id);
    const matches = await Match.find({ users: { $in: ids } }).select('_id');
    await Message.deleteMany({ matchId: { $in: matches.map(m => m._id) } });
    await Match.deleteMany({ users: { $in: ids } });
    await Swipe.deleteMany({ $or: [{ swiper: { $in: ids } }, { target: { $in: ids } }] });
    await Profile.deleteMany({ userId: { $in: ids } });
    await User.deleteMany({ _id: { $in: ids } });
    await mongoose.disconnect();
  }
  for (const publicId of uploaded) await cloudinary.uploader.destroy(publicId);
  console.log('Temporary verification accounts, chats, swipes, and uploaded image removed.');
}
verify().catch(err => { console.error('App verification failed:', err.message); process.exitCode = 1; }).finally(() => cleanup().catch(err => { console.error('Cleanup failed:', err.message); process.exitCode = 1; }));
