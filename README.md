# 128bittrip

**Quests, not itineraries.** The gamified trip planner — part of the [128bit](https://github.com/Hootywhooo86) app family.

## What it is

128bittrip turns vacations into games worth winning:

- 🗺️ **Mission packs** — every destination gets a quest pack (Disneyland-first)
- 📶 **eSIM quests** — connectivity built into the pre-departure checklist
- 💰 **Price-drop alerts** — set a quest, strike when fares drop
- 🏆 **Passport & XP** — pixel stamps per city; trip XP flows into 128bitlife

## Landing page

`index.html` is the coming-soon landing page, served via GitHub Pages at
https://hootywhooo86.github.io/128bittrip/

The waitlist form posts to Formspree — create a free form at
[formspree.io](https://formspree.io) and replace `YOUR_FORM_ID` in
`index.html` to activate it.

## Roadmap

1. Landing page + affiliate signups (Travelpayouts, Booking.com, Airalo, GetYourGuide)
2. ✅ Trip MVP: boss battles, quests, XP/levels, all-in-one booking links, Trip AI, passport
3. Live prices everywhere (flights first via Travelpayouts), price-drop alerts
4. 128bitgold link: trips become savings goals, savings sync back as damage
5. 128bit Trips+ (paid tier) and a server-side Trip AI
6. Shared 128bit account + event feed so 128bitlife can collect trip events

## The family

- 128bitfit — workouts
- 128bitplay — comics, TV, movies, audiobooks
- 128bitgold — budget (planned)
- 128bitlife — the hub: your whole life, one character sheet (planned)
- 128bitmap — benched for being naughty

## The app

The Expo app lives in [`app/`](app/). Run it with `cd app && npm install && npx expo start`.

**Logo:** a 128-bit pixel hotel, defined once in `app/src/brand/pixel-hotel.json`.
`python3 app/scripts/gen-brand.py` (needs Pillow) regenerates the app icon,
splash, favicon and pixel tab icons from it.

| Tab | What it does |
|---|---|
| **Quests** | Level + XP, your active boss, next quests |
| **Trips** | Saved destinations — each one is a boss battle |
| **Book** | All-in-one booking: flights, hotels, cars, eSIM, experiences (affiliate links) |
| **Trip AI** | Enter what you can spend → trips that fit, ready to accept as quests |
| **Passport** | Stamps, stats, 128bit Trips+ (coming soon), settings |

**The game loop:** a trip's total price (flights + hotel + car + eSIM +
experiences + spending money) is the boss's HP. Savings are damage —
entered by hand, or synced from 128bitgold once it ships. Price drops are
critical hits, price rises heal the boss. 25/50/75% milestones, defeating
the boss, booking each category, and checking in on arrival all pay XP.

**Server + secrets:** Trip AI (Claude) and live flight fares run as Expo
Router API routes in `app/src/app/api/`, so API keys never ship inside the
app. Copy `app/.env.example` to `app/.env.local` and fill in
`ANTHROPIC_API_KEY` and `TRAVELPAYOUTS_TOKEN`; `npx expo start` serves the
routes in development. For production, deploy the server with EAS Hosting
(`npx eas-cli@latest deploy`) and set the same two variables there. Without
them the app still works: Trip AI falls back to its on-device planner and
prices stay estimates.

**Currency** follows the phone's region by default (CAD in Canada, USD in
the US…); travelers can pin a currency in Passport → Settings.

**Where things live (`app/src/`):**

- `game/` — store (state, XP awards, persistence), quests & bosses, levels, shared 128bit event schema
- `services/affiliates.ts` — partner link builders. Paste affiliate IDs here as programs approve you.
- `services/prices.ts` — trip cost estimates; live flight fares via `/api/fare`
- `services/trip-ai.ts` — budget → trip plans: Claude via `/api/trip-ai`, on-device planner as fallback
- `app/api/` — server routes (`trip-ai+api.ts`, `fare+api.ts`) holding the API keys
- `services/gold.ts` — 128bitgold savings sync (stubbed until 128bitgold exists)
- `data/destinations.ts` — destination catalog, bosses, experiences and price baselines
