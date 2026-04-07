// Metro config for Expo in a monorepo.
// Forces React/RN to resolve ONLY from apps/mobile/node_modules,
// preventing duplicate React from the hoisted root node_modules.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo (so changes in packages/shared etc. hot-reload)
config.watchFolders = [workspaceRoot];

// 2. Force Metro to resolve from the mobile app's node_modules first, then root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Disable hierarchical lookup — prevents Metro from picking up duplicate
//    React/react-native from root node_modules
config.resolver.disableHierarchicalLookup = true;

// 4. Explicit React + react-native aliases to the mobile app's copies
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

module.exports = config;
