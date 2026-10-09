/**
 * 128bittrip's look: the 128bit family's (src/family/tokens.ts).
 *
 * Monochrome on true black. Colour only ever means data. The accent marks
 * what's yours and what's tappable — done quests, progress, buttons — and is
 * the family default (white) until trip gets an accent picker.
 */
import { DEFAULT_ACCENT, dataColors, neutrals, onAccentFor, PIXEL_FONT } from './family';

export const colors = {
  ...neutrals,
  accent: DEFAULT_ACCENT,
  onAccent: onAccentFor(DEFAULT_ACCENT),
  danger: dataColors.danger,
};

export const fonts = {
  /** Headers, eyebrows, section labels, XP. Never body text. */
  pixel: PIXEL_FONT,
};

/** The pieces every trip screen starts from: the header block and a card. */
export const base = {
  wrap: { flex: 1, backgroundColor: colors.bg },
  hero: { padding: 24, paddingBottom: 8 },
  eyebrow: { fontFamily: fonts.pixel, color: colors.textMuted, fontSize: 8, letterSpacing: 1, marginBottom: 12 },
  title: { fontFamily: fonts.pixel, color: colors.text, fontSize: 18, lineHeight: 26 },
  xp: { fontFamily: fonts.pixel, color: colors.accent, fontSize: 9, marginTop: 10 },
  card: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, padding: 14 },
} as const;
