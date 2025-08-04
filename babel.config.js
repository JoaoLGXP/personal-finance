module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Esta linha é essencial para as animações do menu funcionarem
      'react-native-reanimated/plugin',
    ],
  };
};