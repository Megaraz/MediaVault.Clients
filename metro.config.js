const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const resultPatternRoot = path.resolve(__dirname, '..', '..', 'result-pattern_typescript');
const resultPatternEntry = path.resolve(
  resultPatternRoot,
  'dist/index.js',
);

config.watchFolders = [resultPatternRoot];
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'result-pattern-typescript') {
    return {
      filePath: resultPatternEntry,
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
