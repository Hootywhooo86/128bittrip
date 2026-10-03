/**
 * 128bitgold link — the separate 128bit budgeting app.
 *
 * When linked, each trip becomes a savings goal in 128bitgold and the amount
 * saved flows back here as boss damage. Until 128bitgold ships, travelers
 * type in how much they've saved (manual mode) — the boss battle works the
 * same either way.
 *
 * Wire format is documented in game/events.ts (the 128bitgold contract).
 */

/** Flip on when 128bitgold's API is live. */
export const GOLD_AVAILABLE = false;

/**
 * Amount saved toward a trip according to 128bitgold, or null when not
 * linked / unavailable (the app then keeps the manually entered amount).
 */
export async function fetchGoldSaved(_tripId: string): Promise<number | null> {
  if (!GOLD_AVAILABLE) return null;
  // TODO(128bitgold): GET {GOLD_API}/goals?source=trip&tripId=… with the shared 128bit account token.
  return null;
}
