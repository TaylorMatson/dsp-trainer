const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const config = getDefaultConfig(__dirname);

/** Keep `_ref/` (glsl-trainer copy) out of the runtime bundle. */
const refRoot = path.resolve(__dirname, '_ref');
const previousBlockList = config.resolver.blockList;
config.resolver.blockList = previousBlockList
  ? [previousBlockList, new RegExp(`${escapeRegex(refRoot)}.*`)]
  : new RegExp(`${escapeRegex(refRoot)}.*`);

module.exports = config;

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
