/**
 * Trip cost estimates + live flight prices.
 *
 * Estimates come from the destination catalog and a simple flight-fare
 * table, converted into the trip's currency. When a Travelpayouts API
 * token is configured (EXPO_PUBLIC_TRAVELPAYOUTS_TOKEN), the flight line
 * is replaced with the cheapest live fare for the trip's dates.
 *
 * TODO(backend): move the live-price call behind the 128bit API so the
 * token isn't shipped in the app bundle, and refresh prices on a schedule.
 */

import { Destination, getDestination } from '@/data/destinations';

export type Currency = 'CAD' | 'USD' | 'EUR' | 'GBP' | 'AUD';

/** Rough planning rates from USD. Good enough for budgeting, not for checkout. */
const FROM_USD: Record<Currency, number> = { USD: 1, CAD: 1.37, EUR: 0.92, GBP: 0.78, AUD: 1.5 };

export const CURRENCIES = Object.keys(FROM_USD) as Currency[];

export function fromUsd(usd: number, currency: Currency): number {
  return usd * FROM_USD[currency];
}

export function toUsd(amount: number, currency: Currency): number {
  return amount / FROM_USD[currency];
}

export function formatMoney(amount: number, currency: Currency): string {
  const rounded = Math.round(amount);
  const symbol = currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
  const suffix = currency === 'EUR' || currency === 'GBP' ? '' : ` ${currency}`;
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

const TP_TOKEN = process.env.EXPO_PUBLIC_TRAVELPAYOUTS_TOKEN ?? '';

export const LIVE_PRICES_ENABLED = TP_TOKEN.length > 0;

/**
 * Cheapest live round-trip fare per person, in `currency`, for the month of
 * departDate (Travelpayouts / Aviasales Data API). Returns null when live
 * prices are off or nothing came back.
 */
export async function fetchLiveFare(
  origin: string,
  dest: Destination,
  departDate: string,
  nights: number,
  currency: Currency,
): Promise<number | null> {
  if (!LIVE_PRICES_ENABLED) return null;
  const ret = new Date(`${departDate}T00:00:00Z`);
  ret.setUTCDate(ret.getUTCDate() + nights);
  const params = new URLSearchParams({
    origin: origin.trim().toUpperCase(),
    destination: dest.iata,
    departure_at: departDate.slice(0, 7),
    return_at: ret.toISOString().slice(0, 7),
    currency: currency.toLowerCase(),
    sorting: 'price',
    limit: '1',
    token: TP_TOKEN,
  });
  try {
    const res = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { success?: boolean; data?: { price?: number }[] };
    const price = json.data?.[0]?.price;
    return json.success && typeof price === 'number' ? price : null;
  } catch {
    return null;
  }
}
