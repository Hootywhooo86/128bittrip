/**
 * 128bit UI kit — the same chunky pixel look as the landing page:
 * Press Start 2P headings, hard-edged panels, buttons with a solid drop edge.
 */

import { ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import brand from '@/brand/pixel-hotel.json';
import { BottomTabInset, Colors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const inner = <View style={styles.screenInner}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
    </SafeAreaView>
  );
}

/** Press Start 2P has no accented glyphs — "Cancún" renders as "Cancun". */
function pixelSafe(children: ReactNode): ReactNode {
  return typeof children === 'string' ? children.normalize('NFD').replace(/[\u0300-\u036f]/g, '') : children;
}

type TextTone = 'ink' | 'muted' | 'teal' | 'orange' | 'pink' | 'onBright';

export function PixelText({
  size = 12,
  tone = 'ink',
  style,
  children,
  ...rest
}: TextProps & { size?: number; tone?: TextTone }) {
  return (
    <Text
      style={[{ fontFamily: Fonts.pixel, fontSize: size, lineHeight: size * 1.6, color: Colors[tone] }, style]}
      {...rest}>
      {pixelSafe(children)}
    </Text>
  );
}

export function Body({
  tone = 'ink',
  weight = 'regular',
  size = 15,
  style,
  ...rest
}: TextProps & { tone?: TextTone; weight?: 'regular' | 'semi' | 'bold'; size?: number }) {
  const fontFamily = weight === 'bold' ? Fonts.bodyBold : weight === 'semi' ? Fonts.bodySemi : Fonts.body;
  return <Text style={[{ fontFamily, fontSize: size, lineHeight: size * 1.4, color: Colors[tone] }, style]} {...rest} />;
}

export function Eyebrow({ children, tone = 'teal' }: { children: ReactNode; tone?: TextTone }) {
  return (
    <PixelText size={9} tone={tone} style={{ letterSpacing: 2, marginBottom: Spacing.two }}>
      {children}
    </PixelText>
  );
}

export function Panel({
  children,
  style,
  accent,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  accent?: string;
  onPress?: () => void;
}) {
  const panelStyle = [styles.panel, accent ? { borderColor: accent } : null, style];
  if (!onPress) return <View style={panelStyle}>{children}</View>;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [panelStyle, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

export function PixelButton({
  label,
  onPress,
  variant = 'orange',
  disabled,
  small,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'orange' | 'teal' | 'ghost' | 'pink';
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const palette = {
    orange: { bg: Colors.orange, edge: Colors.orangeDark, text: 'onBright' as const },
    teal: { bg: Colors.teal, edge: Colors.tealDark, text: 'onBright' as const },
    pink: { bg: Colors.pink, edge: '#b23a60', text: 'onBright' as const },
    ghost: { bg: Colors.panel, edge: Colors.line, text: 'ink' as const },
  }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: palette.bg, borderBottomColor: palette.edge },
        variant === 'ghost' && { borderWidth: 2, borderColor: Colors.line },
        pressed && styles.buttonPressed,
        disabled && styles.disabled,
        style,
      ]}>
      <PixelText size={small ? 8 : 10} tone={palette.text} style={{ textAlign: 'center', letterSpacing: 1 }}>
        {label}
      </PixelText>
    </Pressable>
  );
}

/** Segmented 8-bit bar — XP (fills up) or boss HP (drains). */
export function Bar({
  pct,
  color = Colors.teal,
  segments = 20,
  height = 12,
}: {
  pct: number;
  color?: string;
  segments?: number;
  height?: number;
}) {
  const filled = Math.round(Math.max(0, Math.min(1, pct)) * segments);
  return (
    <View style={[styles.bar, { height: height + 6 }]}>
      {Array.from({ length: segments }, (_, i) => (
        <View key={i} style={[styles.barSeg, { backgroundColor: i < filled ? color : Colors.line }]} />
      ))}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, active && styles.chipActive, pressed && styles.pressed]}>
      <Body size={13} weight="semi" tone={active ? 'onBright' : 'ink'}>
        {label}
      </Body>
    </Pressable>
  );
}

export function Field({ label, style, ...props }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: Spacing.two, flex: 1 }}>
      <PixelText size={8} tone="muted" style={{ letterSpacing: 1 }}>
        {label}
      </PixelText>
      <TextInput placeholderTextColor={Colors.muted} style={[styles.input, style]} {...props} />
    </View>
  );
}

export function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 30,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View style={{ gap: Spacing.two, flex: 1 }}>
      <PixelText size={8} tone="muted" style={{ letterSpacing: 1 }}>
        {label}
      </PixelText>
      <View style={styles.stepper}>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Math.max(min, value - 1))}>
          <PixelText size={12} tone="teal">−</PixelText>
        </Pressable>
        <PixelText size={12}>{value}</PixelText>
        <Pressable style={styles.stepBtn} onPress={() => onChange(Math.min(max, value + 1))}>
          <PixelText size={12} tone="teal">+</PixelText>
        </Pressable>
      </View>
    </View>
  );
}

/** The 128bit Trips logo, drawn from src/brand/pixel-hotel.json. */
export function PixelHotel({ size = 48 }: { size?: number }) {
  const grid = brand.grid;
  const palette = brand.palette as Record<string, string>;
  const cell = size / grid.length;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel="128bit Trips logo">
      {grid.map((row, y) => (
        <View key={y} style={{ flexDirection: 'row' }}>
          {row.split('').map((ch, x) => (
            <View
              key={x}
              style={{ width: cell, height: cell, backgroundColor: ch === '.' ? 'transparent' : palette[ch] }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.three }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: BottomTabInset + Spacing.six },
  screenInner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.three,
    gap: Spacing.three,
  },
  panel: {
    backgroundColor: Colors.panel,
    borderWidth: 3,
    borderColor: Colors.line,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: { opacity: 0.75 },
  button: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmall: { paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 4 },
  buttonPressed: { borderBottomWidth: 1, marginTop: 4 },
  disabled: { opacity: 0.4 },
  bar: {
    flexDirection: 'row',
    gap: 2,
    padding: 3,
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: Colors.line,
  },
  barSeg: { flex: 1 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.panel,
  },
  chipActive: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  input: {
    backgroundColor: Colors.bg,
    borderWidth: 2,
    borderColor: Colors.teal,
    color: Colors.ink,
    padding: 12,
    fontSize: 16,
    fontFamily: Fonts.body,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: Colors.line,
    backgroundColor: Colors.bg,
  },
  stepBtn: { paddingVertical: 10, paddingHorizontal: 14 },
});
