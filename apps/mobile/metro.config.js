// Metro config for Expo in a monorepo.
// Prevents duplicate React: the root workspace has React 18 hoisted from
// the web app, while mobile needs React 19. We alias React/react-native
// explicitly and use a simple blockList regex to exclude the duplicates.

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

// Explicit aliases — force React/react-native from mobile's own copy.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

// Block duplicate React copies at the workspace root and in web.
const escapedRoot = workspaceRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
config.resolver.blockList = [
  new RegExp(`${escapedRoot}/node_modules/react/.*`),
  new RegExp(`${escapedRoot}/node_modules/react-native/.*`),
  new RegExp(`${escapedRoot}/apps/web/node_modules/react/.*`),
];

module.exports = config;
