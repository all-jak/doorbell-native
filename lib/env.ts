import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PROXY_PORT = '4000';
let hasLoggedApiBaseUrl = false;

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

const isLoopbackHost = (value: string) => {
  try {
    const hostname = new URL(value).hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  } catch {
    return false;
  }
};

const rewriteLoopbackUrlToExpoHost = (value: string, expoHostUri: string) => {
  try {
    const url = new URL(value);
    const expoHostname = expoHostUri.split(':')[0];

    if (!expoHostname) {
      return null;
    }

    url.hostname = expoHostname;
    return url.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
};

export const getApiBaseUrl = () => {
  const explicitBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  const hostUri = readExpoHost();
  let baseUrl = '';
  let source:
    | 'EXPO_PUBLIC_API_BASE_URL'
    | 'EXPO_PUBLIC_API_BASE_URL_REWRITTEN'
    | 'expo-host'
    | 'localhost-fallback';

  if (explicitBaseUrl) {
    baseUrl = explicitBaseUrl.replace(/\/$/, '');

    if (Platform.OS !== 'web' && isLoopbackHost(baseUrl) && hostUri) {
      const rewrittenBaseUrl = rewriteLoopbackUrlToExpoHost(baseUrl, hostUri);

      if (rewrittenBaseUrl) {
        console.log('[DoorBell env] Rewriting loopback API base URL for native client', {
          from: baseUrl,
          to: rewrittenBaseUrl,
          expoHostUri: hostUri,
        });

        baseUrl = rewrittenBaseUrl;
        source = 'EXPO_PUBLIC_API_BASE_URL_REWRITTEN';
      } else {
        source = 'EXPO_PUBLIC_API_BASE_URL';
      }
    } else {
      source = 'EXPO_PUBLIC_API_BASE_URL';
    }
  } else {
    if (hostUri) {
      const host = hostUri.split(':')[0];
      baseUrl = `http://${host}:${DEFAULT_PROXY_PORT}`;
      source = 'expo-host';
    } else {
      baseUrl = `http://localhost:${DEFAULT_PROXY_PORT}`;
      source = 'localhost-fallback';
    }
  }

  if (!hasLoggedApiBaseUrl) {
    hasLoggedApiBaseUrl = true;
    console.log('[DoorBell env] Resolved API base URL', {
      platform: Platform.OS,
      source,
      baseUrl,
    });

    if (Platform.OS !== 'web' && isLoopbackHost(baseUrl)) {
      console.warn(
        '[DoorBell env] API base URL points to localhost on a native client. Physical devices cannot reach your computer with localhost. Use your machine LAN IP for EXPO_PUBLIC_API_BASE_URL or remove it so Expo host detection can run.'
      );
    }
  }

  return baseUrl;
};
