// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['app/(tabs)/index.tsx'],
    rules: {
      // The design reference page intentionally contains quoted/tagline text.
      // Keep the file untouched and relax this rule only here.
      'react/no-unescaped-entities': 'off',
      // The splash animations use stable refs; keep the reference screen untouched.
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
