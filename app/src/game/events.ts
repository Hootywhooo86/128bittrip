/**
 * 128bit shared event schema (v0.1)
 *
 * Every 128bit app emits these events. 128bitlife subscribes to the feed
 * to generate quests, XP, and suggestions ("log your dinner").
 *
 * Keep this file in sync across all 128bit apps. When the backend lands,
 * emitEvent POSTs to the 128bit event feed; until then it logs locally.
 *
 * 128bitgold contract: `trip.created` and `budget.updated` from app 'trip'
 * carry data { tripId, destination, target, saved, currency, departDate } so
 * 128bitgold can create/refresh a savings goal for the trip. 128bitgold
 * answers with `budget.updated` (app 'gold', data { tripId, saved }), which
 * 128bit Trips applies as damage to the trip's boss.
 */

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
  | 'boss.defeated'
  | 'price.drop'
  | 'level.up'
  | 'matchup.won';

export type Bit128App = 'fit' | 'play' | 'trip' | 'gold' | 'life' | 'fantasy';

export interface Bit128Event {
  name: EventName;
  app: Bit128App;
  /** 128bit account id — stubbed until auth lands. */
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
  'boss.defeated': 500,
  'price.drop': 25,
  'level.up': 0,
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
  // TODO(128bitlife): POST to the 128bit event feed.
  // Local log keeps the contract testable until then.
  console.log('[128bit:event]', JSON.stringify(full));
  return full;
}
