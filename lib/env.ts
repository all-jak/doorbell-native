import Constants from 'expo-constants';

const DEFAULT_PROXY_PORT = '4000';

const readExpoHost = () => {
  const maybeConstants = Constants as typeof Constants & {
    expoGoConfig?: { debuggerHost?: string };
    manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
  };

  return (
    Constants.expoConfig?.hostUri ??
    maybeConstants.expoGoConfig?.debuggerHost ??
    maybeConstants.manifest2?.extra?.expoClient?.hostUri ??
    ''
  );
};

export const getApiBaseUrl = () => {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

  if (explicitBaseUrl) {
    return explicitBaseUrl.replace(/\/$/, '');
  }

  const hostUri = readExpoHost();

  if (hostUri) {
    const host = hostUri.split(':')[0];
    return `http://${host}:${DEFAULT_PROXY_PORT}`;
  }

  return `http://localhost:${DEFAULT_PROXY_PORT}`;
};
