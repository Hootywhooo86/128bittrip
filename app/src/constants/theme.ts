/**
 * 128bit Trips design tokens — same palette and type as the landing page
 * (index.html :root) and the rest of the 128bit family. The app is dark-only.
 */

import { Platform } from 'react-native';

export const Colors = {
  bg: '#0b0b16',
  panel: '#141428',
  line: '#26264a',
  teal: '#2dd4bf',
  tealDark: '#149e8c',
  orange: '#ff9f1c',
  orangeDark: '#b86e0a',
  pink: '#ff5d8f',
  ink: '#f4f1ff',
  muted: '#9a97b8',
  /** Text on orange / teal buttons. */
  onBright: '#201100',
} as const;

export type ColorName = keyof typeof Colors;

/** Font family names registered by useFonts in src/app/_layout.tsx. */
export const Fonts = {
  pixel: 'PressStart2P_400Regular',
  body: 'Inter_400Regular',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_800ExtraBold',
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;
