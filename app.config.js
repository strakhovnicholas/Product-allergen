/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_URL || 'http://79.133.178.179:8080';

  return {
    ...config,
    extra: {
      ...config.extra,
      apiBaseUrl,
    },
    plugins: ['./plugins/withAndroidCleartext.js', ...(config.plugins ?? [])],
  };
};
