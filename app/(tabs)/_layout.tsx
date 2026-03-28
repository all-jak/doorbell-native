import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

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
          backgroundColor: doorbellTheme.colors.tabBar,
          borderTopWidth: 0,
          shadowColor: '#7A3422',
          shadowOpacity: 0.18,
          shadowOffset: { width: 0, height: 8 },
          shadowRadius: 24,
          elevation: 12,
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
