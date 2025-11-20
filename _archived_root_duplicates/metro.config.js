const { getDefaultConfig } = require('expo/metro-config');

// Use Expo's default Metro config. Reanimated is enabled via Babel plugin only.
const config = getDefaultConfig(__dirname);

module.exports = config;
