import { SpaceGrotesk_400Regular, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold, useFonts } from '@expo-google-fonts/space-grotesk';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { doorbellTheme, navigationTheme } from '@/constants/theme';
import { CartProvider } from '@/providers/cart-provider';

SplashScreen.preventAutoHideAsync();

const startupLogo = require('../assets/logo-normal.png');

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return (
      <View style={styles.loadingScreen}>
        <Image source={startupLogo} style={styles.loadingLogo} resizeMode="contain" />
      </View>
    );
  }

  return (
    <ThemeProvider value={navigationTheme}>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: {
              backgroundColor: doorbellTheme.colors.background,
            },
          }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="search" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="category/[slug]" />
          <Stack.Screen name="product/[slug]" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="checkout" />
          <Stack.Screen name="order-success" />
        </Stack>
        <StatusBar style="dark" />
      </CartProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: doorbellTheme.colors.background,
  },
  loadingLogo: {
    width: 208,
    height: 86,
  },
});
