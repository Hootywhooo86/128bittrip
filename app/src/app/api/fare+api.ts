/**
 * GET /api/fare?origin=YEG&destination=SNA&departDate=2027-01-03&nights=5&currency=CAD
 *
 * Cheapest live round-trip fare per person from the Travelpayouts
 * (Aviasales) Data API. The token stays on the server: set
 * TRAVELPAYOUTS_TOKEN in the server environment (Travelpayouts → Profile →
 * API token). Responds { price: null } when it isn't set.
 */

const IATA = /^[A-Z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token) return Response.json({ price: null, reason: 'not-configured' });

  const q = new URL(request.url).searchParams;
  const origin = (q.get('origin') ?? '').toUpperCase();
  const destination = (q.get('destination') ?? '').toUpperCase();
  const departDate = q.get('departDate') ?? '';
  const nights = Number(q.get('nights') ?? '0');
  const currency = (q.get('currency') ?? 'USD').toLowerCase();
  if (!IATA.test(origin) || !IATA.test(destination) || !DATE.test(departDate) || !(nights >= 0 && nights <= 60)) {
    return Response.json({ error: 'bad request' }, { status: 400 });
  }

  const ret = new Date(`${departDate}T00:00:00Z`);
  ret.setUTCDate(ret.getUTCDate() + nights);
  const params = new URLSearchParams({
    origin,
    destination,
    departure_at: departDate.slice(0, 7),
    return_at: ret.toISOString().slice(0, 7),
    currency,
    sorting: 'price',
    limit: '1',
  });

  try {
    const res = await fetch(`https://api.travelpayouts.com/aviasales/v3/prices_for_dates?${params}`, {
      headers: { 'X-Access-Token': token },
    });
    if (!res.ok) return Response.json({ price: null, reason: `upstream ${res.status}` });
    const json = (await res.json()) as { success?: boolean; data?: { price?: number }[] };
    const price = json.data?.[0]?.price;
    return Response.json({ price: json.success && typeof price === 'number' ? price : null });
  } catch {
    return Response.json({ price: null, reason: 'upstream unreachable' });
  }
}
