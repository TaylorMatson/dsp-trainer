import { SymbolView } from 'expo-symbols';
import { Tabs } from 'expo-router';

import { AvTheme } from '@/constants/AvTheme';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: AvTheme.bg,
          borderTopColor: AvTheme.line,
        },
        headerStyle: { backgroundColor: AvTheme.bg },
        headerTintColor: AvTheme.ink,
        headerTitleStyle: { color: AvTheme.ink },
        headerShown: true,
        sceneStyle: { backgroundColor: AvTheme.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'house', android: 'home', web: 'home' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="demo"
        options={{
          title: 'Lab',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{
                ios: 'hammer',
                android: 'build',
                web: 'build',
              }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => (
            <SymbolView
              name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
              tintColor={color}
              size={28}
            />
          ),
        }}
      />
    </Tabs>
  );
}
