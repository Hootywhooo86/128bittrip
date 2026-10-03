/**
 * Quests and bosses are derived from trip state, so they never drift out
 * of sync with what the traveler actually did.
 */

import { getDestination } from '@/data/destinations';
import type { Category } from '@/services/prices';

import type { Trip } from './store';

export const SAVE_MILESTONES = [25, 50, 75] as const;
export const MILESTONE_XP = 75;

export const BOOKING_XP: Record<Category, number> = {
  flight: 100,
  hotel: 100,
  car: 60,
  esim: 40,
  experience: 60,
};

export const CATEGORY_META: Record<Category, { label: string; noun: string; emoji: string; quest: string }> = {
  flight: { label: 'Flights', noun: 'flights', emoji: '✈️', quest: 'Board the Skyship' },
  hotel: { label: 'Hotels', noun: 'a hotel', emoji: '🏨', quest: 'Find Your Base Camp' },
  car: { label: 'Cars', noun: 'a rental car', emoji: '🚗', quest: 'Get Your Mount' },
  esim: { label: 'eSIM', noun: 'an eSIM', emoji: '📶', quest: 'Stay Connected' },
  experience: { label: 'Experiences', noun: 'experiences', emoji: '🎟️', quest: 'Side Quests' },
};

export const CATEGORIES: Category[] = ['flight', 'hotel', 'car', 'esim', 'experience'];

/** Categories this trip actually needs. */
export function tripCategories(trip: Trip): Category[] {
  return CATEGORIES.filter((c) => {
    if (c === 'car') return trip.includeCar;
    if (c === 'esim') return trip.cost.esim > 0;
    if (c === 'experience') return trip.experienceIds.length > 0;
    if (c === 'flight') return trip.cost.flight > 0;
    return true;
  });
}

export interface Boss {
  name: string;
  emoji: string;
  maxHp: number;
  hp: number;
  /** 0–1 of HP remaining. */
  pct: number;
  defeated: boolean;
}

export function bossFor(trip: Trip): Boss {
  const dest = getDestination(trip.destinationId);
  const maxHp = Math.max(1, trip.cost.total);
  const hp = Math.max(0, maxHp - trip.saved);
  return {
    name: dest?.boss.name ?? 'The Unknown',
    emoji: dest?.boss.emoji ?? '❓',
    maxHp,
    hp,
    pct: hp / maxHp,
    defeated: hp === 0,
  };
}

export type QuestKind = 'save' | 'book' | 'boss' | 'checkin';

export interface Quest {
  id: string;
  tripId: string;
  kind: QuestKind;
  category?: Category;
  title: string;
  detail: string;
  xp: number;
  done: boolean;
}

export function daysUntil(date: string, now = new Date()): number {
  const target = new Date(`${date}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

export function questsFor(trip: Trip): Quest[] {
  const dest = getDestination(trip.destinationId);
  const city = dest?.city ?? 'your trip';
  const boss = bossFor(trip);
  const savedPct = (trip.saved / Math.max(1, trip.cost.total)) * 100;
  const quests: Quest[] = SAVE_MILESTONES.map((m) => ({
    id: `${trip.id}:save-${m}`,
    tripId: trip.id,
    kind: 'save' as const,
    title: `Save ${m}% for ${city}`,
    detail: `Deal ${m}% damage to ${boss.name}`,
    xp: MILESTONE_XP,
    done: trip.milestones.includes(m) || savedPct >= m,
  }));
  quests.push({
    id: `${trip.id}:boss`,
    tripId: trip.id,
    kind: 'boss',
    title: `Defeat ${boss.name}`,
    detail: 'Fully fund the trip to unlock the bundle',
    xp: 500,
    done: trip.bossDefeated,
  });
  for (const c of tripCategories(trip)) {
    quests.push({
      id: `${trip.id}:book-${c}`,
      tripId: trip.id,
      kind: 'book',
      category: c,
      title: CATEGORY_META[c].quest,
      detail: `Book ${CATEGORY_META[c].noun} for ${city}`,
      xp: BOOKING_XP[c],
      done: !!trip.booked[c],
    });
  }
  quests.push({
    id: `${trip.id}:checkin`,
    tripId: trip.id,
    kind: 'checkin',
    title: `Land in ${city}`,
    detail: 'Check in on arrival to earn the passport stamp',
    xp: 120,
    done: trip.checkedIn,
  });
  return quests;
}
