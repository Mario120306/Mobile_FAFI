// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Allow requiring text files as bundled assets (e.g. require('./file.txt'))
config.resolver.assetExts = Array.from(new Set([...(config.resolver.assetExts || []), 'txt']));

module.exports = config;
