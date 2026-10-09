/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { Buffer } = require('node:buffer');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const queryString = require('query-string');

test('patched URI decoder preserves navigation queries and handles malformed input', () => {
  assert.deepEqual({ ...queryString.parse('matchId=abc123&initialMessage=Hi%20%F0%9F%91%8B') }, { initialMessage: 'Hi 👋', matchId: 'abc123' });
  assert.deepEqual({ ...queryString.parse('tag=a&tag=b&empty=&literal=%25') }, { empty: '', literal: '%', tag: ['a', 'b'] });
  const result = spawnSync(process.execPath, ['-e', "const q=require('query-string');q.parse('bad='+('%E0%A4%'.repeat(10000)));"], { cwd: path.resolve(__dirname, '..'), timeout: 5000 });
  assert.equal(result.error, undefined, 'Malformed query decoding must complete without a timeout');
  assert.equal(result.status, 0);
});

test('patched Metro image parser still reads buffered and file-based image dimensions', async () => {
  const assets = require(path.resolve(__dirname, '../node_modules/metro/src/Assets.js'));
  const photo = path.resolve(__dirname, '../Profiles/cld-sample.jpg');
  const size = assets.getAssetSize('jpg', fs.readFileSync(photo), photo);
  assert(size.width > 0 && size.height > 0);
  const asset = await assets.getAssetData(photo, 'Profiles/cld-sample.jpg', [], null, '/assets');
  assert.equal(asset.width, size.width); assert.equal(asset.height, size.height);
});

test('patched UUID keeps Xcode project IDs compatible and rejects short buffers', () => {
  const project = require('xcode').project('not-read.pbxproj');
  project.allUuids = () => [];
  assert.match(project.generateUuid(), /^[A-F0-9]{24}$/);
  const uuid = require('uuid');
  assert.throws(() => uuid.v3('test', uuid.v3.DNS, Buffer.alloc(1)));
});

test('patched PostCSS does not disclose an absolute external source map', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'roomiematch-postcss-test-'));
  const file = path.join(dir, 'outside.map');
  const marker = 'roomiematch-test-private-map';
  try {
    fs.writeFileSync(file, JSON.stringify({ version: 3, sources: ['private.txt'], names: [], mappings: '', sourcesContent: [marker] }));
    const css = 'a{color:red}\n/*# sourceMappingURL=' + file.replace(/\\/g, '/') + ' */';
    const result = await require('postcss')([]).process(css, { map: { inline: false }, from: undefined });
    assert(!result.map || !JSON.stringify(result.map.toJSON()).includes(marker));
  } finally { fs.unlinkSync(file); fs.rmdirSync(dir); }
});