import { Stack } from 'expo-router';

export default function ModuleLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
      }}>
      <Stack.Screen name="index" options={{ title: 'Module' }} />
      <Stack.Screen name="lesson" options={{ title: 'Lesson' }} />
      <Stack.Screen name="demo" options={{ title: 'Demo' }} />
      <Stack.Screen name="practice" options={{ title: 'Practice' }} />
    </Stack>
  );
}
