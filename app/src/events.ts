/**
 * 128bit shared event schema (v0.1)
 *
 * Every 128bit app emits these events. 128bitlife subscribes to the feed
 * to generate quests, XP, and suggestions ("log your dinner").
 *
 * Keep this file in sync across all 128bit apps. emitEvent sends each event to
 * the 128bit family feed (src/family.ts) when signed in to a 128bit family
 * account; the feed's schema is 128bittracker's docs/EVENTS.md (name → type,
 * XP rides along in data).
 */

import { queueFamilyEvent } from './family';

export type EventName =
  | 'workout.logged'
  | 'meal.logged'
  | 'booking.made'
  | 'budget.updated'
  | 'expense.logged'
  | 'under_budget.week'
  | 'savings_goal.hit'
  | 'quest.completed'
  | 'trip.created'
  | 'trip.packing.done'
  | 'trip.checkin'
  | 'esim.purchased'
  | 'matchup.won';

export type Bit128App = 'fit' | 'play' | 'trip' | 'gold' | 'life' | 'fantasy';

export interface Bit128Event {
  name: EventName;
  app: Bit128App;
  /** Local tag; the family feed knows the account from the sign-in. */
  userId: string;
  /** ISO-8601 timestamp, filled by emitEvent. */
  occurredAt: string;
  /** XP awarded for this event. */
  xp: number;
  data?: Record<string, unknown>;
}

/** XP table — single source of truth for the 128bit economy. */
export const XP: Record<EventName, number> = {
  'workout.logged': 50,
  'meal.logged': 20,
  'booking.made': 100,
  'budget.updated': 20,
  'expense.logged': 10,
  'under_budget.week': 150,
  'savings_goal.hit': 300,
  'quest.completed': 50,
  'trip.created': 100,
  'trip.packing.done': 80,
  'trip.checkin': 120,
  'esim.purchased': 40,
  'matchup.won': 100,
};

export function emitEvent(
  e: Omit<Bit128Event, 'occurredAt' | 'xp'> & { xp?: number }
): Bit128Event {
  const full: Bit128Event = {
    ...e,
    xp: e.xp ?? XP[e.name] ?? 10,
    occurredAt: new Date().toISOString(),
  };
  queueFamilyEvent(full.name, { ...full.data, xp: full.xp }, Date.parse(full.occurredAt));
  return full;
}
