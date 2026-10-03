/**
 * Destination catalog. Every destination is a boss to beat.
 *
 * Prices are rough USD planning baselines (mid-range, per person where it
 * applies), used for estimates until live partner prices come back. Tune
 * freely — they only seed the estimates in services/prices.ts.
 */

export type Vibe = 'beach' | 'city' | 'theme-parks' | 'nature' | 'food' | 'party';

export interface Experience {
  id: string;
  name: string;
  /** USD per person. */
  price: number;
}

export interface Destination {
  id: string;
  city: string;
  country: string;
  /** Main airport IATA code — used for flight searches. */
  iata: string;
  region: 'na-west' | 'na-east' | 'mexico-carib' | 'europe' | 'asia' | 'oceania';
  vibes: Vibe[];
  /** USD per night, mid-range double room. */
  hotelNight: number;
  /** USD per day, compact car. 0 = you won't want a car here. */
  carDay: number;
  /** USD eSIM data pack for a ~week. 0 = home network usually works. */
  esim: number;
  /** USD per person per day for food + local transport. */
  dailySpend: number;
  boss: { name: string; emoji: string };
  experiences: Experience[];
}

export const DESTINATIONS: Destination[] = [
  {
    id: 'anaheim', city: 'Anaheim', country: 'USA', iata: 'SNA', region: 'na-west',
    vibes: ['theme-parks', 'food'], hotelNight: 210, carDay: 55, esim: 18, dailySpend: 90,
    boss: { name: 'The Mouse King', emoji: '🏰' },
    experiences: [
      { id: 'dl-1day', name: 'Disneyland 1-day ticket', price: 165 },
      { id: 'dl-hopper', name: 'Park Hopper add-on', price: 65 },
      { id: 'knotts', name: "Knott's Berry Farm", price: 95 },
    ],
  },
  {
    id: 'las-vegas', city: 'Las Vegas', country: 'USA', iata: 'LAS', region: 'na-west',
    vibes: ['party', 'food', 'city'], hotelNight: 150, carDay: 50, esim: 18, dailySpend: 110,
    boss: { name: 'The Neon Pharaoh', emoji: '🎰' },
    experiences: [
      { id: 'lv-show', name: 'Headline show', price: 120 },
      { id: 'lv-canyon', name: 'Grand Canyon day trip', price: 210 },
      { id: 'lv-sphere', name: 'Sphere experience', price: 110 },
    ],
  },
  {
    id: 'honolulu', city: 'Honolulu', country: 'USA', iata: 'HNL', region: 'na-west',
    vibes: ['beach', 'nature', 'food'], hotelNight: 280, carDay: 65, esim: 18, dailySpend: 110,
    boss: { name: 'The Lava Titan', emoji: '🌋' },
    experiences: [
      { id: 'hnl-snorkel', name: 'Hanauma Bay snorkel', price: 60 },
      { id: 'hnl-luau', name: 'Traditional luau', price: 150 },
      { id: 'hnl-surf', name: 'Waikiki surf lesson', price: 90 },
    ],
  },
  {
    id: 'vancouver', city: 'Vancouver', country: 'Canada', iata: 'YVR', region: 'na-west',
    vibes: ['nature', 'city', 'food'], hotelNight: 190, carDay: 50, esim: 0, dailySpend: 85,
    boss: { name: 'The Rain Serpent', emoji: '🌧️' },
    experiences: [
      { id: 'yvr-capilano', name: 'Capilano Suspension Bridge', price: 50 },
      { id: 'yvr-grouse', name: 'Grouse Mountain Skyride', price: 65 },
      { id: 'yvr-whale', name: 'Whale-watching tour', price: 150 },
    ],
  },
  {
    id: 'new-york', city: 'New York', country: 'USA', iata: 'JFK', region: 'na-east',
    vibes: ['city', 'food'], hotelNight: 290, carDay: 0, esim: 18, dailySpend: 120,
    boss: { name: 'The Concrete Colossus', emoji: '🗽' },
    experiences: [
      { id: 'nyc-broadway', name: 'Broadway show', price: 160 },
      { id: 'nyc-top', name: 'Top of the Rock', price: 45 },
      { id: 'nyc-food', name: 'Food tour', price: 95 },
    ],
  },
  {
    id: 'orlando', city: 'Orlando', country: 'USA', iata: 'MCO', region: 'na-east',
    vibes: ['theme-parks', 'beach'], hotelNight: 170, carDay: 50, esim: 18, dailySpend: 85,
    boss: { name: 'The Castle Wyrm', emoji: '🐉' },
    experiences: [
      { id: 'mco-mk', name: 'Magic Kingdom 1-day', price: 160 },
      { id: 'mco-uni', name: 'Universal 1-day', price: 150 },
      { id: 'mco-ksc', name: 'Kennedy Space Center', price: 80 },
    ],
  },
  {
    id: 'cancun', city: 'Cancún', country: 'Mexico', iata: 'CUN', region: 'mexico-carib',
    vibes: ['beach', 'party', 'nature'], hotelNight: 160, carDay: 40, esim: 15, dailySpend: 70,
    boss: { name: 'The Jade Serpent', emoji: '🐍' },
    experiences: [
      { id: 'cun-chichen', name: 'Chichén Itzá day trip', price: 110 },
      { id: 'cun-cenote', name: 'Cenote swim', price: 70 },
      { id: 'cun-isla', name: 'Isla Mujeres catamaran', price: 90 },
    ],
  },
  {
    id: 'mexico-city', city: 'Mexico City', country: 'Mexico', iata: 'MEX', region: 'mexico-carib',
    vibes: ['city', 'food'], hotelNight: 110, carDay: 0, esim: 15, dailySpend: 55,
    boss: { name: 'The Feathered Serpent', emoji: '🪶' },
    experiences: [
      { id: 'mex-teo', name: 'Teotihuacán pyramids', price: 65 },
      { id: 'mex-lucha', name: 'Lucha libre night', price: 45 },
      { id: 'mex-taco', name: 'Street taco crawl', price: 55 },
    ],
  },
  {
    id: 'london', city: 'London', country: 'UK', iata: 'LHR', region: 'europe',
    vibes: ['city', 'food'], hotelNight: 230, carDay: 0, esim: 12, dailySpend: 110,
    boss: { name: 'The Fog Knight', emoji: '💂' },
    experiences: [
      { id: 'lon-hp', name: 'Harry Potter studio tour', price: 75 },
      { id: 'lon-tower', name: 'Tower of London', price: 45 },
      { id: 'lon-west', name: 'West End show', price: 90 },
    ],
  },
  {
    id: 'paris', city: 'Paris', country: 'France', iata: 'CDG', region: 'europe',
    vibes: ['city', 'food'], hotelNight: 220, carDay: 0, esim: 12, dailySpend: 105,
    boss: { name: 'The Iron Lady', emoji: '🗼' },
    experiences: [
      { id: 'par-eiffel', name: 'Eiffel Tower summit', price: 40 },
      { id: 'par-louvre', name: 'Louvre timed entry', price: 30 },
      { id: 'par-seine', name: 'Seine dinner cruise', price: 120 },
    ],
  },
  {
    id: 'lisbon', city: 'Lisbon', country: 'Portugal', iata: 'LIS', region: 'europe',
    vibes: ['city', 'food', 'beach'], hotelNight: 140, carDay: 35, esim: 12, dailySpend: 70,
    boss: { name: 'The Tram Golem', emoji: '🚋' },
    experiences: [
      { id: 'lis-sintra', name: 'Sintra palaces day trip', price: 75 },
      { id: 'lis-fado', name: 'Fado dinner show', price: 70 },
      { id: 'lis-surf', name: 'Surf lesson', price: 55 },
    ],
  },
  {
    id: 'reykjavik', city: 'Reykjavík', country: 'Iceland', iata: 'KEF', region: 'europe',
    vibes: ['nature'], hotelNight: 210, carDay: 75, esim: 15, dailySpend: 110,
    boss: { name: 'The Frost Giant', emoji: '🧊' },
    experiences: [
      { id: 'kef-lagoon', name: 'Blue Lagoon', price: 95 },
      { id: 'kef-golden', name: 'Golden Circle tour', price: 90 },
      { id: 'kef-aurora', name: 'Northern lights hunt', price: 85 },
    ],
  },
  {
    id: 'tokyo', city: 'Tokyo', country: 'Japan', iata: 'HND', region: 'asia',
    vibes: ['city', 'food', 'theme-parks'], hotelNight: 160, carDay: 0, esim: 15, dailySpend: 80,
    boss: { name: 'The Neon Shogun', emoji: '🗾' },
    experiences: [
      { id: 'tyo-disney', name: 'Tokyo DisneySea', price: 70 },
      { id: 'tyo-teamlab', name: 'teamLab Planets', price: 25 },
      { id: 'tyo-sumo', name: 'Sumo morning practice', price: 90 },
    ],
  },
  {
    id: 'bali', city: 'Bali', country: 'Indonesia', iata: 'DPS', region: 'asia',
    vibes: ['beach', 'nature', 'party'], hotelNight: 90, carDay: 30, esim: 12, dailySpend: 45,
    boss: { name: 'The Temple Guardian', emoji: '🛕' },
    experiences: [
      { id: 'dps-batur', name: 'Mount Batur sunrise trek', price: 55 },
      { id: 'dps-ubud', name: 'Ubud rice terraces + swing', price: 40 },
      { id: 'dps-dive', name: 'Nusa Penida snorkel trip', price: 70 },
    ],
  },
  {
    id: 'bangkok', city: 'Bangkok', country: 'Thailand', iata: 'BKK', region: 'asia',
    vibes: ['city', 'food', 'party'], hotelNight: 80, carDay: 0, esim: 10, dailySpend: 40,
    boss: { name: 'The Golden Naga', emoji: '🐲' },
    experiences: [
      { id: 'bkk-palace', name: 'Grand Palace + Wat Pho', price: 30 },
      { id: 'bkk-float', name: 'Floating market tour', price: 45 },
      { id: 'bkk-muay', name: 'Muay Thai night', price: 50 },
    ],
  },
  {
    id: 'sydney', city: 'Sydney', country: 'Australia', iata: 'SYD', region: 'oceania',
    vibes: ['beach', 'city', 'nature'], hotelNight: 200, carDay: 50, esim: 15, dailySpend: 95,
    boss: { name: 'The Harbour Kraken', emoji: '🦑' },
    experiences: [
      { id: 'syd-bridge', name: 'Harbour Bridge climb', price: 210 },
      { id: 'syd-opera', name: 'Opera House tour', price: 30 },
      { id: 'syd-bondi', name: 'Bondi surf lesson', price: 80 },
    ],
  },
];

export function getDestination(id: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.id === id);
}

export const VIBES: { id: Vibe; label: string; emoji: string }[] = [
  { id: 'beach', label: 'Beach', emoji: '🏖️' },
  { id: 'city', label: 'City', emoji: '🏙️' },
  { id: 'theme-parks', label: 'Theme parks', emoji: '🎢' },
  { id: 'nature', label: 'Nature', emoji: '🏔️' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'party', label: 'Nightlife', emoji: '🪩' },
];
