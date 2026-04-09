module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-worklets-core is required by react-native-vision-camera
      // for frame processors (ML Kit Pose Detection runs inside worklets).
      'react-native-worklets-core/plugin',
    ],
  };
};
