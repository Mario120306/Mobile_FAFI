import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';

import { LoadingProvider } from '@/contexts/loading-context';
import { PartitionsProvider } from '@/contexts/partitions-context';
import { SoundsProvider } from '@/contexts/sounds-context';
import { ThemeModeProvider } from '@/contexts/theme-mode-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

enableScreens(true);

export default function RootLayout() {
  return (
    <ThemeModeProvider>
      <RootLayoutInner />
    </ThemeModeProvider>
  );
}

function RootLayoutInner() {
  const colorScheme = useColorScheme();

  return (
    <LoadingProvider>
      <SoundsProvider>
        <PartitionsProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="player" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </PartitionsProvider>
      </SoundsProvider>
    </LoadingProvider>
  );
}
