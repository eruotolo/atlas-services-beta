const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../');

const config = getDefaultConfig(projectRoot);

// Watch all files within the monorepo so Metro sees shared packages
config.watchFolders = [workspaceRoot];

// Resolve modules from appmobile first, then the workspace root
// This is required for pnpm workspaces where packages are symlinked, not hoisted
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// Follow pnpm symlinks — without this Metro cannot resolve symlinked packages
config.resolver.unstable_enableSymlinks = true;

module.exports = withNativeWind(config, { input: './global.css' });
