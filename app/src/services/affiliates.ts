/**
 * Affiliate link builders for 128bit Trips — one per booking category.
 *
 * Fill in the IDs below as each program approves you, then every
 * booking button in the app starts earning. Until then the builders
 * return plain (untagged) deep links so nothing breaks.
 *
 * See README.md for the signup checklist.
 */

import type { Destination } from '@/data/destinations';
import type { Category } from '@/services/prices';

export const AFFILIATES = {
  /** Travelpayouts marker (Partner ID), e.g. '123456'. Covers flights, hotels, cars. */
  travelpayoutsMarker: 'YOUR_TP_MARKER',
  /** Awin publisher id + Booking.com advertiser id (MID). */
  awinPublisherId: '',
  bookingAwinMid: '',
  /** Airalo partner link (Travelpayouts short link). Tracks eSIM sales. */
  airaloLink: 'https://airalo.tpk.mx/7vGaig1n',
  /** GetYourGuide partner id. */
  getYourGuidePartnerId: '',
};

const TP = 'https://tp.media/r';

/** Wrap any URL in the Travelpayouts redirect with our marker. */
function tpWrap(targetUrl: string): string {
  if (!AFFILIATES.travelpayoutsMarker || AFFILIATES.travelpayoutsMarker === 'YOUR_TP_MARKER') {
    return targetUrl;
  }
  return `${TP}?marker=${AFFILIATES.travelpayoutsMarker}&u=${encodeURIComponent(targetUrl)}`;
}

/** yyyy-mm-dd → ddmm, the Aviasales search-path date format. */
function ddmm(date: string): string {
  return `${date.slice(8, 10)}${date.slice(5, 7)}`;
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Hotel search deep link (Hotellook via Travelpayouts). */
export function hotelSearchLink(destination: string, checkIn?: string, checkOut?: string): string {
  const q = encodeURIComponent(destination);
  let url = `https://hotellook.com/?destination=${q}`;
  if (checkIn) url += `&checkIn=${checkIn}`;
  if (checkOut) url += `&checkOut=${checkOut}`;
  return tpWrap(url);
}

/** Flight search deep link (Aviasales via Travelpayouts). Dates are yyyy-mm-dd. */
export function flightSearchLink(
  origin: string,
  destination: string,
  departDate?: string,
  returnDate?: string,
  travelers = 1,
): string {
  const o = encodeURIComponent(origin.toUpperCase());
  const d = encodeURIComponent(destination.toUpperCase());
  const path = departDate
    ? `${o}${ddmm(departDate)}${d}${returnDate ? ddmm(returnDate) : ''}${travelers}`
    : `${o}${d}${travelers}`;
  return tpWrap(`https://www.aviasales.com/search/${path}`);
}

/** Car rental search (Discover Cars via Travelpayouts). */
export function carSearchLink(destination: string): string {
  return tpWrap(`https://www.discovercars.com/?location=${encodeURIComponent(destination)}`);
}

/** eSIM purchase link (Airalo). */
export function esimLink(): string {
  return AFFILIATES.airaloLink || 'https://www.airalo.com/';
}

/** Tours, tickets & activities search (GetYourGuide). */
export function experienceSearchLink(query: string): string {
  const url = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}`;
  return AFFILIATES.getYourGuidePartnerId
    ? `${url}&partner_id=${encodeURIComponent(AFFILIATES.getYourGuidePartnerId)}`
    : url;
}

/** Booking.com deep link via Awin (falls back to plain link). */
export function bookingComLink(destination: string): string {
  const inner = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destination)}`;
  if (AFFILIATES.awinPublisherId && AFFILIATES.bookingAwinMid) {
    return (
      `https://www.awin1.com/cread.php?awinmid=${AFFILIATES.bookingAwinMid}` +
      `&awinaffid=${AFFILIATES.awinPublisherId}&ued=${encodeURIComponent(inner)}`
    );
  }
  return inner;
}

export interface BookingTarget {
  dest: Destination;
  origin: string;
  departDate?: string;
  nights: number;
  travelers: number;
}

/** The partner link for one booking category of a trip. */
export function linkFor(category: Category, t: BookingTarget): string {
  const place = `${t.dest.city}, ${t.dest.country}`;
  const checkOut = t.departDate ? addDays(t.departDate, t.nights) : undefined;
  switch (category) {
    case 'flight':
      return flightSearchLink(t.origin, t.dest.iata, t.departDate, checkOut, t.travelers);
    case 'hotel':
      return hotelSearchLink(place, t.departDate, checkOut);
    case 'car':
      return carSearchLink(place);
    case 'esim':
      return esimLink();
    case 'experience':
      return experienceSearchLink(t.dest.city);
  }
}
