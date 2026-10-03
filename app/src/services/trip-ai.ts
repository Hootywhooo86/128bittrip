/**
 * Trip AI: "here's what I can spend" → ranked trip plans that fit.
 *
 * v1 runs on-device over the destination catalog: for every destination it
 * finds the longest stay that fits the budget, adds a car where it helps,
 * fills leftover budget with experiences, then ranks by vibe match and how
 * well the plan uses the budget.
 *
 * The async signature is deliberate — a server-side model can replace
 * `planTrips` later without touching the screen.
 */

import { Destination, DESTINATIONS, Vibe } from '@/data/destinations';

import { CostBreakdown, Currency, estimateTrip, TripSpec } from './prices';

export interface PlanRequest {
  budget: number;
  currency: Currency;
  origin: string;
  travelers: number;
  /** Fixed trip length, or undefined to let the AI pick (3–7 nights). */
  nights?: number;
  vibes: Vibe[];
}

export interface TripPlan {
  dest: Destination;
  spec: TripSpec;
  cost: CostBreakdown;
  leftover: number;
  vibeMatches: Vibe[];
  pitch: string;
  score: number;
}

const NIGHT_OPTIONS = [7, 6, 5, 4, 3];

function planFor(dest: Destination, req: PlanRequest): TripPlan | null {
  const vibeMatches = req.vibes.filter((v) => dest.vibes.includes(v));
  const wantsCar = dest.carDay > 0 && (dest.vibes.includes('nature') || req.vibes.includes('nature'));
  const nightsToTry = req.nights ? [req.nights] : NIGHT_OPTIONS;

  for (const nights of nightsToTry) {
    for (const includeCar of wantsCar ? [true, false] : [false]) {
      const base: TripSpec = {
        destinationId: dest.id,
        origin: req.origin,
        nights,
        travelers: req.travelers,
        includeCar,
        experienceIds: [],
        currency: req.currency,
      };
      let cost = estimateTrip(base);
      if (cost.total > req.budget) continue;

      // Fill leftover budget with experiences, cheapest first.
      const spec = { ...base, experienceIds: [] as string[] };
      for (const e of [...dest.experiences].sort((a, b) => a.price - b.price)) {
        const trial = estimateTrip({ ...spec, experienceIds: [...spec.experienceIds, e.id] });
        if (trial.total <= req.budget) {
          spec.experienceIds.push(e.id);
          cost = trial;
        }
      }

      const used = cost.total / req.budget;
      const vibeScore = req.vibes.length ? vibeMatches.length / req.vibes.length : 0.5;
      const score = vibeScore * 2 + used + nights / 14 + spec.experienceIds.length * 0.05;
      const pitch = [
        `${nights} nights in ${dest.city}`,
        includeCar ? 'with wheels' : null,
        spec.experienceIds.length ? `+ ${spec.experienceIds.length} side quest${spec.experienceIds.length > 1 ? 's' : ''}` : null,
      ]
        .filter(Boolean)
        .join(' ');
      return { dest, spec, cost, leftover: req.budget - cost.total, vibeMatches, pitch, score };
    }
  }
  return null;
}

export async function planTrips(req: PlanRequest, limit = 3): Promise<TripPlan[]> {
  if (!(req.budget > 0) || req.travelers < 1) return [];
  return DESTINATIONS.filter((d) => d.iata !== req.origin.trim().toUpperCase())
    .map((d) => planFor(d, req))
    .filter((p): p is TripPlan => p !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/** Cheapest bare-bones 3-night trip from this origin — shown when nothing fits. */
export function cheapestTrip(req: PlanRequest): { dest: Destination; total: number } | null {
  let best: { dest: Destination; total: number } | null = null;
  for (const dest of DESTINATIONS) {
    if (dest.iata === req.origin.trim().toUpperCase()) continue;
    const { total } = estimateTrip({
      destinationId: dest.id,
      origin: req.origin,
      nights: 3,
      travelers: req.travelers,
      includeCar: false,
      experienceIds: [],
      currency: req.currency,
    });
    if (!best || total < best.total) best = { dest, total };
  }
  return best;
}
