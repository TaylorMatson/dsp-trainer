import { Stack } from 'expo-router';

import { AvTheme } from '@/constants/AvTheme';

export default function ModuleLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
        headerStyle: { backgroundColor: AvTheme.bg },
        headerTintColor: AvTheme.ink,
        headerTitleStyle: { color: AvTheme.ink },
        contentStyle: { backgroundColor: AvTheme.bg },
      }}>
      <Stack.Screen name="index" options={{ title: 'Module' }} />
      <Stack.Screen name="lesson" options={{ title: 'Lesson' }} />
      <Stack.Screen name="demo" options={{ title: 'Demo' }} />
      <Stack.Screen name="practice" options={{ title: 'Practice' }} />
    </Stack>
  );
}
