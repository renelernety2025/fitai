// Metro config for Expo in a monorepo.
// Prevents duplicate React: the root workspace has React 18 hoisted from
// the web app, while mobile needs React 19. We block the root React path
// and explicitly alias React/react-native to mobile's own node_modules.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo.
config.watchFolders = [workspaceRoot];

// Resolve from mobile first, then workspace root (for transitive deps).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Explicit aliases — force React from mobile's own copy.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Block the duplicate React at the workspace root so Metro never picks it up.
config.resolver.blockList = exclusionList([
  new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react')}/.*`),
  new RegExp(`${path.resolve(workspaceRoot, 'node_modules/react-native')}/.*`),
  // Also block web's React so it can't be resolved via hierarchical lookup
  new RegExp(`${path.resolve(workspaceRoot, 'apps/web/node_modules/react')}/.*`),
]);

module.exports = config;
