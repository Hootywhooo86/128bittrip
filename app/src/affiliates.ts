/**
 * Affiliate link builders for 128bittrip.
 *
 * Fill in the IDs below as each program approves you, then every
 * booking button in the app starts earning. Until then the builders
 * return plain (untagged) deep links so nothing breaks.
 *
 * See README.md for the signup checklist.
 */

export const AFFILIATES = {
  /** Travelpayouts marker (Partner ID), e.g. '123456'. */
  travelpayoutsMarker: 'YOUR_TP_MARKER',
  /** Awin publisher id + Booking.com advertiser id (MID). */
  awinPublisherId: '',
  bookingAwinMid: '',
  /** Airalo referral / Impact tracking id. */
  airaloRef: '',
};

const TP = 'https://tp.media/r';

/** Wrap any URL in the Travelpayouts redirect with our marker. */
function tpWrap(targetUrl: string): string {
  if (!AFFILIATES.travelpayoutsMarker || AFFILIATES.travelpayoutsMarker === 'YOUR_TP_MARKER') {
    return targetUrl;
  }
  return `${TP}?marker=${AFFILIATES.travelpayoutsMarker}&u=${encodeURIComponent(targetUrl)}`;
}

/** Hotel search deep link (Hotellook / Booking.com via Travelpayouts). */
export function hotelSearchLink(destination: string, checkIn?: string, checkOut?: string): string {
  const q = encodeURIComponent(destination);
  let url = `https://hotellook.com/?destination=${q}`;
  if (checkIn) url += `&checkIn=${checkIn}`;
  if (checkOut) url += `&checkOut=${checkOut}`;
  return tpWrap(url);
}

/** Flight search deep link (Aviasales via Travelpayouts). */
export function flightSearchLink(origin: string, destination: string): string {
  const url = `https://www.aviasales.com/search/${encodeURIComponent(origin)}${encodeURIComponent(destination)}1`;
  return tpWrap(url);
}

/** eSIM purchase link (Airalo). */
export function esimLink(): string {
  if (AFFILIATES.airaloRef) {
    return `https://www.airalo.com/?ref=${encodeURIComponent(AFFILIATES.airaloRef)}`;
  }
  return 'https://www.airalo.com/';
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
