// Enter provider-rotated credentials privately; validate before updating .env.
// This configures credentials. It does not perform provider-side rotation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const readline = require('node:readline');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const file = path.resolve(__dirname, '../.env');
function hidden(prompt) {
  if (!process.stdin.isTTY) throw new Error('Run this command in your own interactive terminal.');
  process.stdout.write(prompt);
  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true); process.stdin.resume();
  return new Promise((resolve, reject) => {
    let value = '';
    function finish() { process.stdin.off('keypress', key); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); }
    function key(text, event = {}) {
      if (event.ctrl && event.name === 'c') { finish(); reject(new Error('Cancelled; configuration unchanged.')); }
      else if (event.name === 'return' || event.name === 'enter') { finish(); resolve(value); }
      else if (event.name === 'backspace') value = value.slice(0, -1);
      else if (text && !event.ctrl && !event.meta) value += text;
    }
    process.stdin.on('keypress', key);
  });
}
(async () => {
  const original = fs.readFileSync(file, 'utf8');
  const old = dotenv.parse(original);
  if (old.DNS_SERVERS) require('node:dns').setServers(old.DNS_SERVERS.split(','));
  console.log('First change the Atlas database password and create a replacement Cloudinary API key in their dashboards.');
  console.log('Values entered below are hidden and are never placed in command arguments or logs.');
  const password = await hidden('New Atlas database password: ');
  const apiKey = await hidden('New Cloudinary API key: ');
  const apiSecret = await hidden('New Cloudinary API secret: ');
  const uri = new URL(old.MONGO_URI);
  if (password.length < 16) throw new Error('Use a generated Atlas password of at least 16 characters.');
  if (decodeURIComponent(uri.password) === password || old.CLOUDINARY_API_SECRET === apiSecret) throw new Error('Replacement credentials must differ from the exposed credentials.');
  if (!apiKey || !apiSecret) throw new Error('Cloudinary credentials are required.');
  uri.password = encodeURIComponent(password);
  const updated = { MONGO_URI: uri.toString(), CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret, JWT_SECRET: crypto.randomBytes(48).toString('base64url') };
  console.log('Checking replacement database and Cloudinary access…');
  let connected = false;
  try { await mongoose.connect(updated.MONGO_URI, { serverSelectionTimeoutMS: 10000 }); connected = true; }
  catch { throw new Error('Replacement Atlas login failed. Check the saved database password and network access; .env unchanged.'); }
  finally { if (connected) await mongoose.disconnect(); }
  cloudinary.config({ cloud_name: old.CLOUDINARY_CLOUD_NAME, api_key: apiKey, api_secret: apiSecret });
  try { await cloudinary.api.ping({ timeout: 15000 }); }
  catch { throw new Error('Replacement Cloudinary login failed; .env unchanged.'); }
  let next = original;
  for (const [name, value] of Object.entries(updated)) {
    const line = name + '=' + JSON.stringify(value);
    const regex = new RegExp('^' + name + '=.*$', 'm');
    next = regex.test(next) ? next.replace(regex, () => line) : next + '\n' + line + '\n';
  }
  if (fs.readFileSync(file, 'utf8') !== original) throw new Error('Configuration changed during validation; retry rather than overwrite it.');
  const temp = file + '.rotation.tmp';
  fs.writeFileSync(temp, next, { mode: 0o600 }); fs.renameSync(temp, file);
  console.log('New credentials verified and saved privately. JWT signing secret rotated; existing app sessions must log in again.');
  console.log('Disable the old Cloudinary key in its dashboard. Restart local backend/preview servers and update any hosting environment privately.');
  console.log('Provider-side revocation is still required; this command does not revoke the old key or clean Git history.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });