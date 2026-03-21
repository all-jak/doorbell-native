const { expo: baseConfig } = require("./app.json");

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
