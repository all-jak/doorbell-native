const baseConfig = {
  name: "doorbell",
  slug: "doorbell",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "doorbell",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E6F4FE",
      foregroundImage: "./assets/images/android-icon-foreground.png",
      backgroundImage: "./assets/images/android-icon-background.png",
      monochromeImage: "./assets/images/android-icon-monochrome.png",
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        image: "./assets/logo-normal.png",
        imageWidth: 200,
        resizeMode: "contain",
        backgroundColor: "#FFF7F2",
        dark: {
          backgroundColor: "#FFF7F2",
        },
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    eas: {
      projectId: "1eb352b5-8e32-4c25-a825-d19433f4e811",
    },
  },
  owner: "doorbellshop",
};

const projectId = baseConfig.extra.eas.projectId;
const iconPath = "./assets/images/doorbell-app-icon.png";
const adaptiveForegroundPath = "./assets/images/doorbell-adaptive-foreground.png";
const identifiersByEnv = {
  development: "app.doorbell.dev",
  staging: "app.doorbell.staging",
  production: "app.doorbell.shop",
};

module.exports = () => {
  const appEnv = process.env.APP_ENV ?? "production";
  const isStaging = appEnv === "staging";
  const appIdentifier = identifiersByEnv[appEnv] ?? identifiersByEnv.production;

  return {
    ...baseConfig,
    icon: iconPath,
    ios: {
      ...baseConfig.ios,
      bundleIdentifier: appIdentifier,
    },
    android: {
      ...baseConfig.android,
      package: appIdentifier,
      adaptiveIcon: {
        foregroundImage: adaptiveForegroundPath,
        backgroundColor: "#FFFFFF",
      },
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    // Only staging builds are wired to EAS Update.
    updates: isStaging
      ? {
          enabled: true,
          url: `https://u.expo.dev/${projectId}`,
        }
      : {
          enabled: false,
        },
  };
};
