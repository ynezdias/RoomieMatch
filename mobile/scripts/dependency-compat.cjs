/* global __dirname */
// Expo SDK 54's consumers expect older CommonJS APIs. These narrow adapters
// let us use patched upstream packages without replacing Expo/native versions.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function adapt(relative, oldText, newText) {
  const target = path.join(root, 'node_modules', relative);
  const source = fs.readFileSync(target, 'utf8');
  if (source.includes(newText)) return;
  if (!source.includes(oldText)) throw new Error('Dependency API changed; review security adapter for ' + relative);
  fs.writeFileSync(target, source.replace(oldText, newText));
}
adapt('query-string/index.js',
  "const decodeComponent = require('decode-uri-component');",
  "const decodeModule = require('decode-uri-component');\nconst decodeComponent = typeof decodeModule === 'function' ? decodeModule : decodeModule.default;");
adapt('metro/src/Assets.js',
  '_interopRequireDefault(require("image-size"))',
  '_interopRequireDefault(require("image-size").imageSize)');
adapt('metro/src/Assets.js',
  '_imageSize.default)(isImageInput)',
  '_imageSize.default)(typeof isImageInput === "string" ? _fs.default.readFileSync(isImageInput) : isImageInput)');
console.log('Applied Expo security dependency API adapters.');