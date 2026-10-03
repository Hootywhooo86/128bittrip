/**
 * Game state: XP, trips (bosses), passport stamps, settings.
 *
 * Every action that earns XP goes through `commit`, which emits the shared
 * 128bit event, queues a reward toast, and persists to device storage.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { getDestination } from '@/data/destinations';
import { localCurrency } from '@/services/locale';
import {
  Category,
  CostBreakdown,
  Currency,
  estimateTrip,
  fetchLiveFare,
  toUsd,
  TripSpec,
} from '@/services/prices';

import { Bit128Event, emitEvent, EventName, XP } from './events';
import { levelInfo } from './levels';
import { BOOKING_XP, daysUntil, MILESTONE_XP, SAVE_MILESTONES } from './quests';

export interface Trip extends TripSpec {
  id: string;
  /** yyyy-mm-dd */
  departDate: string;
  cost: CostBreakdown;
  priceSource: 'estimate' | 'live';
  priceHistory: { at: string; total: number }[];
  /** Amount saved toward the trip, in trip currency. */
  saved: number;
  savingsSource: 'manual' | 'gold';
  /** Save milestones (percent) already rewarded. */
  milestones: number[];
  /** Day (yyyy-mm-dd) a savings update last earned XP — one XP payout per day. */
  lastSaveXpDay?: string;
  booked: Partial<Record<Category, boolean>>;
  bossDefeated: boolean;
  checkedIn: boolean;
  createdAt: string;
}

export interface Stamp {
  destinationId: string;
  at: string;
}

export interface Settings {
  homeAirport: string;
  /** Currency for new trips. Follows the device region while currencyAuto is on. */
  currency: Currency;
  currencyAuto: boolean;
  /** True once the traveler links 128bitgold (budget sync). */
  goldLinked: boolean;
}

export interface GameState {
  version: 1;
  xp: number;
  trips: Trip[];
  stamps: Stamp[];
  settings: Settings;
}

export type RewardKind = 'xp' | 'level' | 'crit' | 'heal' | 'boss';

export interface Reward {
  id: number;
  kind: RewardKind;
  title: string;
  detail?: string;
}

const STORAGE_KEY = '128bittrip:state:v1';

const INITIAL: GameState = {
  version: 1,
  xp: 0,
  trips: [],
  stamps: [],
  settings: { homeAirport: 'YEG', currency: localCurrency(), currencyAuto: true, goldLinked: false },
};

const today = () => new Date().toISOString().slice(0, 10);

type Award = { name: EventName; xp?: number; title: string; kind?: RewardKind; data?: Record<string, unknown> };

export interface NewTrip extends Omit<TripSpec, 'currency'> {
  departDate: string;
}

interface GameApi {
  state: GameState;
  hydrated: boolean;
  rewards: Reward[];
  dismissReward: (id: number) => void;
  createTrip: (t: NewTrip) => string;
  deleteTrip: (id: string) => void;
  setSaved: (id: string, saved: number) => void;
  claimBooking: (id: string, category: Category) => void;
  refreshPrices: (id: string) => Promise<void>;
  checkIn: (id: string) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameApi | null>(null);

function goldData(trip: Trip) {
  return {
    tripId: trip.id,
    destination: trip.destinationId,
    target: trip.cost.total,
    saved: trip.saved,
    currency: trip.currency,
    departDate: trip.departDate,
  };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const stateRef = useRef(state);
  const rewardId = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const saved = JSON.parse(raw) as GameState;
        if (saved.version === 1) {
          const settings = { ...INITIAL.settings, ...saved.settings };
          if (settings.currencyAuto) settings.currency = localCurrency();
          const next = { ...INITIAL, ...saved, settings };
          stateRef.current = next;
          setState(next);
        }
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  const pushReward = useCallback((r: Omit<Reward, 'id'>) => {
    const id = ++rewardId.current;
    setRewards((prev) => [...prev.slice(-2), { ...r, id }]);
  }, []);

  /** Apply a new state, pay out awards (events + XP + toasts) and persist. */
  const commit = useCallback(
    (next: GameState, awards: Award[] = [], notices: Omit<Reward, 'id'>[] = []) => {
      const before = levelInfo(next.xp);
      let xp = next.xp;
      const events: Bit128Event[] = [];
      for (const a of awards) {
        const e = emitEvent({ name: a.name, app: 'trip', userId: 'local', xp: a.xp, data: a.data });
        events.push(e);
        xp += e.xp;
      }
      const final = { ...next, xp };
      stateRef.current = final;
      setState(final);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(final)).catch(() => {});

      notices.forEach(pushReward);
      awards.forEach((a, i) => {
        if (events[i].xp > 0 || a.kind) {
          pushReward({ kind: a.kind ?? 'xp', title: a.title, detail: events[i].xp ? `+${events[i].xp} XP` : undefined });
        }
      });
      const after = levelInfo(xp);
      if (after.level > before.level) {
        emitEvent({ name: 'level.up', app: 'trip', userId: 'local', data: { level: after.level } });
        pushReward({ kind: 'level', title: `LEVEL ${after.level}!`, detail: after.title });
      }
    },
    [pushReward],
  );

  const updateTrip = (trips: Trip[], id: string, fn: (t: Trip) => Trip) =>
    trips.map((t) => (t.id === id ? fn(t) : t));

  const createTrip = useCallback(
    (t: NewTrip) => {
      const s = stateRef.current;
      const spec: TripSpec = { ...t, origin: t.origin.toUpperCase(), currency: s.settings.currency };
      const cost = estimateTrip(spec);
      const trip: Trip = {
        ...spec,
        id: `${t.destinationId}-${Date.now().toString(36)}`,
        departDate: t.departDate,
        cost,
        priceSource: 'estimate',
        priceHistory: [{ at: new Date().toISOString(), total: cost.total }],
        saved: 0,
        savingsSource: s.settings.goldLinked ? 'gold' : 'manual',
        milestones: [],
        booked: {},
        bossDefeated: false,
        checkedIn: false,
        createdAt: new Date().toISOString(),
      };
      const dest = getDestination(t.destinationId);
      commit({ ...s, trips: [...s.trips, trip] }, [
        { name: 'trip.created', title: `Quest accepted: ${dest?.city}`, data: goldData(trip) },
      ]);
      return trip.id;
    },
    [commit],
  );

  const deleteTrip = useCallback(
    (id: string) => {
      const s = stateRef.current;
      commit({ ...s, trips: s.trips.filter((t) => t.id !== id) });
    },
    [commit],
  );

  const setSaved = useCallback(
    (id: string, amount: number) => {
      const s = stateRef.current;
      const trip = s.trips.find((t) => t.id === id);
      if (!trip || !Number.isFinite(amount)) return;
      const saved = Math.max(0, Math.round(amount));
      const delta = saved - trip.saved;
      if (delta === 0) return;

      const awards: Award[] = [];
      const notices: Omit<Reward, 'id'>[] = [];
      const pct = (saved / Math.max(1, trip.cost.total)) * 100;
      const milestones = [...trip.milestones];
      let lastSaveXpDay = trip.lastSaveXpDay;
      let bossDefeated = trip.bossDefeated;
      const updated = { ...trip, saved };

      if (delta > 0) {
        const payToday = lastSaveXpDay !== today();
        if (payToday) lastSaveXpDay = today();
        awards.push({
          name: 'budget.updated',
          xp: payToday ? XP['budget.updated'] : 0,
          title: `HIT! −${delta.toLocaleString('en-US')} HP`,
          kind: 'xp',
          data: goldData(updated),
        });
        for (const m of SAVE_MILESTONES) {
          if (pct >= m && !milestones.includes(m)) {
            milestones.push(m);
            awards.push({ name: 'quest.completed', xp: MILESTONE_XP, title: `${m}% saved!`, data: { tripId: id, milestone: m } });
          }
        }
        if (pct >= 100 && !bossDefeated) {
          bossDefeated = true;
          awards.push({ name: 'boss.defeated', title: 'BOSS DEFEATED!', kind: 'boss', data: { tripId: id } });
          awards.push({ name: 'savings_goal.hit', xp: 0, title: 'Booking bundle unlocked', data: goldData(updated) });
        }
      } else {
        emitEvent({ name: 'budget.updated', app: 'trip', userId: 'local', xp: 0, data: goldData(updated) });
        notices.push({ kind: 'heal', title: `Boss healed +${(-delta).toLocaleString('en-US')} HP` });
      }

      commit(
        {
          ...s,
          trips: updateTrip(s.trips, id, () => ({ ...updated, milestones, lastSaveXpDay, bossDefeated })),
        },
        awards,
        notices,
      );
    },
    [commit],
  );

  const claimBooking = useCallback(
    (id: string, category: Category) => {
      const s = stateRef.current;
      const trip = s.trips.find((t) => t.id === id);
      if (!trip || trip.booked[category]) return;
      const name: EventName = category === 'esim' ? 'esim.purchased' : 'booking.made';
      commit(
        { ...s, trips: updateTrip(s.trips, id, (t) => ({ ...t, booked: { ...t.booked, [category]: true } })) },
        [{ name, xp: BOOKING_XP[category], title: 'Quest complete!', data: { tripId: id, category } }],
      );
    },
    [commit],
  );

  const refreshPrices = useCallback(
    async (id: string) => {
      const trip = stateRef.current.trips.find((t) => t.id === id);
      const dest = trip && getDestination(trip.destinationId);
      if (!trip || !dest) return;
      const live = await fetchLiveFare(trip.origin, dest, trip.departDate, trip.nights, trip.currency);
      const cost = estimateTrip(trip, live == null ? undefined : toUsd(live, trip.currency));
      const s = stateRef.current;
      const current = s.trips.find((t) => t.id === id);
      if (!current) return;
      const drop = current.cost.total - cost.total;
      const updated: Trip = {
        ...current,
        cost,
        priceSource: live == null ? 'estimate' : 'live',
        priceHistory: [...current.priceHistory.slice(-29), { at: new Date().toISOString(), total: cost.total }],
      };
      const trips = updateTrip(s.trips, id, () => updated);
      if (drop > 0) {
        commit({ ...s, trips }, [
          { name: 'price.drop', title: `CRITICAL HIT! Price −${drop.toLocaleString('en-US')}`, kind: 'crit', data: goldData(updated) },
        ]);
      } else if (drop < 0) {
        commit({ ...s, trips }, [], [{ kind: 'heal', title: `Price rose · boss healed +${(-drop).toLocaleString('en-US')}` }]);
      } else {
        commit({ ...s, trips });
      }
    },
    [commit],
  );

  const checkIn = useCallback(
    (id: string) => {
      const s = stateRef.current;
      const trip = s.trips.find((t) => t.id === id);
      if (!trip || trip.checkedIn || daysUntil(trip.departDate) > 0) return;
      const hasStamp = s.stamps.some((st) => st.destinationId === trip.destinationId);
      commit(
        {
          ...s,
          trips: updateTrip(s.trips, id, (t) => ({ ...t, checkedIn: true })),
          stamps: hasStamp ? s.stamps : [...s.stamps, { destinationId: trip.destinationId, at: today() }],
        },
        [{ name: 'trip.checkin', title: 'Passport stamped!', data: { tripId: id, destination: trip.destinationId } }],
      );
    },
    [commit],
  );

  const updateSettings = useCallback(
    (patch: Partial<Settings>) => {
      const s = stateRef.current;
      commit({ ...s, settings: { ...s.settings, ...patch } });
    },
    [commit],
  );

  const resetGame = useCallback(() => commit(INITIAL), [commit]);

  const dismissReward = useCallback((id: number) => setRewards((prev) => prev.filter((r) => r.id !== id)), []);

  const api = useMemo<GameApi>(
    () => ({
      state,
      hydrated,
      rewards,
      dismissReward,
      createTrip,
      deleteTrip,
      setSaved,
      claimBooking,
      refreshPrices,
      checkIn,
      updateSettings,
      resetGame,
    }),
    [state, hydrated, rewards, dismissReward, createTrip, deleteTrip, setSaved, claimBooking, refreshPrices, checkIn, updateSettings, resetGame],
  );

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>;
}

export function useGame(): GameApi {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>');
  return ctx;
}

export function useTrip(id: string | undefined): Trip | undefined {
  return useGame().state.trips.find((t) => t.id === id);
}
