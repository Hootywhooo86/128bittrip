import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { PressStart2P_400Regular } from '@expo-google-fonts/press-start-2p';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { RewardToasts } from '@/components/game';
import { Colors, Fonts } from '@/constants/theme';
import { GameProvider, useGame } from '@/game/store';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: Colors.bg, card: Colors.bg, primary: Colors.teal, text: Colors.ink, border: Colors.line },
};

function AppStack() {
  const { hydrated } = useGame();
  const [fontsLoaded, fontError] = useFonts({
    PressStart2P_400Regular,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_800ExtraBold,
  });
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.bg },
          headerTintColor: Colors.teal,
          headerTitleStyle: { fontFamily: Fonts.pixel, fontSize: 12, color: Colors.ink },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: Colors.bg },
          headerBackButtonDisplayMode: 'minimal',
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="trip/[id]" options={{ title: 'BOSS BATTLE' }} />
        <Stack.Screen name="new-trip" options={{ title: 'NEW QUEST', presentation: 'modal' }} />
      </Stack>
      <RewardToasts />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <StatusBar style="light" />
      <GameProvider>
        <AppStack />
      </GameProvider>
    </ThemeProvider>
  );
}
