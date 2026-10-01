import { useFonts } from 'expo-font';
import { Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { AvNavigationTheme } from '@/constants/AvNavigationTheme';
import { ProgressProvider } from '@/progress/ProgressContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ProgressProvider>
      <RootLayoutNav />
    </ProgressProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={AvNavigationTheme}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: AvNavigationTheme.colors.card },
          headerTintColor: AvNavigationTheme.colors.text,
          headerTitleStyle: { color: AvNavigationTheme.colors.text },
          contentStyle: { backgroundColor: AvNavigationTheme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="module/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="privacy" options={{ title: 'Privacy Policy' }} />
      </Stack>
    </ThemeProvider>
  );
}
