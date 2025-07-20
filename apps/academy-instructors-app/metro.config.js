const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for shared modules
const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

config.watchFolders = [
  monorepoRoot,
  path.resolve(monorepoRoot, 'shared'),
];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

config.resolver.alias = {
  '@shared': path.resolve(monorepoRoot, 'shared'),
};

// Support for TypeScript paths
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

module.exports = config;