// Expo + pnpm monorepo setup: pnpm's symlinked node_modules layout needs
// Metro's symlink support explicitly enabled, plus the workspace root added
// to watchFolders/nodeModulesPaths so it can resolve @komala/shared and
// hoisted deps that live outside apps/mobile/node_modules.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
