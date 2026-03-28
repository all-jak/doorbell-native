import { DefaultTheme, type Theme } from '@react-navigation/native';

export const doorbellTheme = {
  colors: {
    background: '#FFF7F2',
    backgroundAlt: '#FCEDE6',
    surface: '#FFFFFF',
    surfaceMuted: '#FFF2EB',
    accent: '#DB2728',
    accentStrong: '#B91F20',
    accentSoft: '#FFE7E3',
    accentWash: '#FFD3CE',
    text: '#211714',
    textMuted: '#7B6660',
    border: '#F1DCD4',
    success: '#16784A',
    warning: '#C97000',
    shadow: 'rgba(115, 36, 24, 0.12)',
    tabBar: 'rgba(255,255,255,0.96)',
    chip: '#FFF1E9',
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
  },
  radius: {
    sm: 14,
    md: 20,
    lg: 28,
    pill: 999,
  },
  fonts: {
    regular: 'SpaceGrotesk_400Regular',
    medium: 'SpaceGrotesk_500Medium',
    bold: 'SpaceGrotesk_700Bold',
  },
};

export const Colors = {
  light: {
    text: doorbellTheme.colors.text,
    background: doorbellTheme.colors.background,
    tint: doorbellTheme.colors.accent,
    icon: doorbellTheme.colors.textMuted,
    tabIconDefault: doorbellTheme.colors.textMuted,
    tabIconSelected: doorbellTheme.colors.accent,
  },
  dark: {
    text: doorbellTheme.colors.text,
    background: doorbellTheme.colors.background,
    tint: doorbellTheme.colors.accent,
    icon: doorbellTheme.colors.textMuted,
    tabIconDefault: doorbellTheme.colors.textMuted,
    tabIconSelected: doorbellTheme.colors.accent,
  },
};

export const Fonts = doorbellTheme.fonts;

export const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: doorbellTheme.colors.background,
    card: doorbellTheme.colors.surface,
    text: doorbellTheme.colors.text,
    border: doorbellTheme.colors.border,
    primary: doorbellTheme.colors.accent,
    notification: doorbellTheme.colors.accent,
  },
  fonts: DefaultTheme.fonts,
};
