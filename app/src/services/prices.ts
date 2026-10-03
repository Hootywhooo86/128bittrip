/**
 * Trip cost estimates + live flight prices.
 *
 * Estimates come from the destination catalog and a simple flight-fare
 * table, converted into the trip's currency. Live fares come from our own
 * server route (src/app/api/fare+api.ts), which holds the Travelpayouts
 * token — when it's configured, the flight line becomes the cheapest live
 * fare for the trip's dates.
 */

import { Destination, getDestination } from '@/data/destinations';

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'AUD' | 'NZD' | 'MXN' | 'JPY';

/** Rough planning rates from USD. Good enough for budgeting, not for checkout. */
const FROM_USD: Record<Currency, number> = {
  USD: 1,
  CAD: 1.37,
  EUR: 0.92,
  GBP: 0.78,
  AUD: 1.5,
  NZD: 1.65,
  MXN: 18.5,
  JPY: 148,
};

export const CURRENCIES = Object.keys(FROM_USD) as Currency[];

export function fromUsd(usd: number, currency: Currency): number {
  return usd * FROM_USD[currency];
}

export function toUsd(amount: number, currency: Currency): number {
  return amount / FROM_USD[currency];
}

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = Math.round(amount);
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : '$';
  const suffix = ['EUR', 'GBP', 'JPY'].includes(currency) ? '' : ` ${currency}`;
  return `${symbol}${rounded.toLocaleString('en-US')}${suffix}`;
}

type Region = Destination['region'];

/** Home airports we know the region of. Unknown codes are treated as na-west. */
const AIRPORT_REGION: Record<string, Region> = {
  YEG: 'na-west', YYC: 'na-west', YVR: 'na-west', YXE: 'na-west', YWG: 'na-west', SEA: 'na-west',
  PDX: 'na-west', SFO: 'na-west', LAX: 'na-west', SNA: 'na-west', SAN: 'na-west', LAS: 'na-west',
  PHX: 'na-west', DEN: 'na-west', SLC: 'na-west', HNL: 'na-west',
  YYZ: 'na-east', YUL: 'na-east', YOW: 'na-east', YHZ: 'na-east', JFK: 'na-east', EWR: 'na-east',
  BOS: 'na-east', ORD: 'na-east', ATL: 'na-east', MIA: 'na-east', MCO: 'na-east', DFW: 'na-east',
  IAH: 'na-east', IAD: 'na-east',
};

/** USD round-trip economy fare per person, by origin region → destination region. */
const FARES: Partial<Record<Region, Record<Region, number>>> = {
  'na-west': { 'na-west': 330, 'na-east': 450, 'mexico-carib': 560, europe: 1050, asia: 1250, oceania: 1550 },
  'na-east': { 'na-west': 450, 'na-east': 300, 'mexico-carib': 450, europe: 850, asia: 1350, oceania: 1750 },
};

export type Category = 'flight' | 'hotel' | 'car' | 'esim' | 'experience';

export interface CostBreakdown {
  flight: number;
  hotel: number;
  car: number;
  esim: number;
  experience: number;
  /** Food + local transport. Not bookable, but it's part of the boss. */
  spending: number;
  total: number;
}

export interface TripSpec {
  destinationId: string;
  origin: string;
  nights: number;
  travelers: number;
  includeCar: boolean;
  experienceIds: string[];
  currency: Currency;
}

export function originRegion(origin: string): Region {
  return AIRPORT_REGION[origin.trim().toUpperCase()] ?? 'na-west';
}

/** Per-person round-trip fare estimate in USD. */
export function estimateFareUsd(origin: string, dest: Destination): number {
  if (origin.trim().toUpperCase() === dest.iata) return 0;
  const table = FARES[originRegion(origin)] ?? FARES['na-west']!;
  return table[dest.region];
}

export function estimateTrip(spec: TripSpec, flightPerPersonUsd?: number): CostBreakdown {
  const dest = getDestination(spec.destinationId);
  if (!dest) throw new Error(`Unknown destination ${spec.destinationId}`);
  const c = (usd: number) => Math.round(fromUsd(usd, spec.currency));
  const days = spec.nights + 1;
  const rooms = Math.ceil(spec.travelers / 2);
  const experiences = dest.experiences
    .filter((e) => spec.experienceIds.includes(e.id))
    .reduce((sum, e) => sum + e.price, 0);

  const flight = c((flightPerPersonUsd ?? estimateFareUsd(spec.origin, dest)) * spec.travelers);
  const hotel = c(dest.hotelNight * spec.nights * rooms);
  const car = spec.includeCar ? c(dest.carDay * days) : 0;
  const esim = c(dest.esim * (spec.nights > 10 ? 1.5 : 1) * spec.travelers);
  const experience = c(experiences * spec.travelers);
  const spending = c(dest.dailySpend * days * spec.travelers);
  return { flight, hotel, car, esim, experience, spending, total: flight + hotel + car + esim + experience + spending };
}

/**
 * Cheapest live round-trip fare per person, in `currency`, for the trip's
 * month, via our server route. Returns null when live prices aren't set up
 * on the server or nothing came back.
 */
export async function fetchLiveFare(
  origin: string,
  dest: Destination,
  departDate: string,
  nights: number,
  currency: Currency,
): Promise<number | null> {
  const params = new URLSearchParams({
    origin: origin.trim().toUpperCase(),
    destination: dest.iata,
    departDate,
    nights: String(nights),
    currency,
  });
  try {
    const res = await fetch(`/api/fare?${params}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { price?: number | null };
    return typeof json.price === 'number' ? json.price : null;
  } catch {
    return null;
  }
}
