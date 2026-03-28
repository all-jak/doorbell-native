import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { doorbellTheme } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: doorbellTheme.colors.background },
        tabBarActiveTintColor: doorbellTheme.colors.accent,
        tabBarInactiveTintColor: doorbellTheme.colors.textMuted,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarBackground: () => (
          <View pointerEvents="none" style={styles.tabBarBackgroundWrap}>
            <View style={styles.tabBarShadow} />
            <View style={styles.tabBarFrame} />
            <View style={styles.tabBarBackground} />
            <View style={styles.tabBarOutline} />
          </View>
        ),
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: 18,
          height: 76,
          borderRadius: 38,
          paddingBottom: 12,
          paddingTop: 10,
          paddingHorizontal: 10,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          overflow: 'visible',
          shadowOpacity: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          borderRadius: 24,
        },
        tabBarLabelStyle: {
          fontFamily: doorbellTheme.fonts.medium,
          fontSize: 12,
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? 'home-variant' : 'home-variant-outline'}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Categories',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? 'view-grid' : 'view-grid-outline'}
              size={26}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="top-picks"
        options={{
          title: 'Top Picks',
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons
              color={color}
              name={focused ? 'star-circle' : 'star-circle-outline'}
              size={26}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarBackgroundWrap: {
    ...StyleSheet.absoluteFillObject,
  },
  tabBarShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 7,
  },
  tabBarFrame: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 38,
    backgroundColor: doorbellTheme.colors.accent,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 37,
    backgroundColor: doorbellTheme.colors.tabBar,
  },
  tabBarOutline: {
    position: 'absolute',
    top: 1,
    right: 1,
    bottom: 1,
    left: 1,
    borderRadius: 37,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
});
