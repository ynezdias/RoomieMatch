const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const dotenv = require('dotenv');
const root = path.resolve(__dirname, '../..');
const localEnv = fs.existsSync(path.join(root, 'backend/.env')) ? dotenv.parse(fs.readFileSync(path.join(root, 'backend/.env'))) : {};
const secretNames = ['MONGO_URI', 'JWT_SECRET', 'CLOUDINARY_API_SECRET'];
const files = cp.execFileSync('git', ['ls-files', '--cached', '--', ':!:**/node_modules/**'], { cwd: root, encoding: 'utf8' }).trim().split(/\r?\n/).filter(Boolean);
let failures = 0;
for (const file of files) {
  if (/\/\.env(?:\.|$)/.test(file) && !file.endsWith('.example')) {
    console.error(`Secret environment file is tracked: ${file}`); failures++;
  }
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isFile() || /\.(?:png|jpe?g|gif|webp|woff2?|ttf|mp4|pdf)$/i.test(file)) continue;
  const content = fs.readFileSync(absolute, 'utf8');
  for (const key of secretNames) {
    if (localEnv[key] && content.includes(localEnv[key])) {
      console.error(`Local ${key} found in tracked file: ${file}`); failures++;
    }
  }
  if (!file.endsWith('.env.example') && /mongodb(?:\+srv)?:\/\/[^\s:]+:[^\s@]+@/.test(content)) {
    console.error(`Database credentials embedded in tracked file: ${file}`); failures++;
  }
}
console.log(failures ? `Secret check failed (${failures} findings).` : 'Tracked files contain no local secrets or credential-bearing MongoDB URIs.');
process.exitCode = failures ? 1 : 0;
