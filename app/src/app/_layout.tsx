import { PressStart2P_400Regular, useFonts } from '@expo-google-fonts/press-start-2p';
import { DarkTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

// The 128bit family is dark-only: true black, white text, one accent.
const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    primary: colors.accent,
  },
};

export default function TabLayout() {
  // PressStart2P is the family pixel face. If it fails to load, the system
  // font stands in rather than holding the app on a blank screen.
  const [fontLoaded, fontError] = useFonts({ PressStart2P_400Regular });
  if (!fontLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <ThemeProvider value={navTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
