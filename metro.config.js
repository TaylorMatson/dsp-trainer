const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

/** Keep `_ref/` (glsl-trainer copy) out of the runtime bundle. */
const existing = config.resolver.blockList;
const refBlock = /(?:^|[\\/])_ref[\\/].*/;
config.resolver.blockList = Array.isArray(existing)
  ? [...existing, refBlock]
  : existing
    ? [existing, refBlock]
    : [refBlock];

module.exports = config;
