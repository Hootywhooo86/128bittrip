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

1. Landing page + affiliate signups (Travelpayouts, Booking.com, Airalo)
2. Trip MVP: countdown, checklist, booking links — dogfooded at Disneyland Oct 2026
3. Real booking APIs (Duffel for flights, hotel APIs)
4. ~~Shared 128bit account + event schema so 128bitlife can collect trip events~~ done: see below

## The family

- 128bitfit — workouts
- 128bitplay — comics, TV, movies, audiobooks
- 128bitgold — budget (planned)
- 128bitlife — the hub: your whole life, one character sheet (planned)
- 128bitmap — benched for being naughty

## The app

The Expo app lives in [`app/`](app/) — Quests, Checklist, Book, and Passport tabs, the shared 128bit event schema (`src/events.ts`), and affiliate link builders (`src/affiliates.ts`). Run it with `cd app && npx expo install && npx expo start`.

## 128bit family account

Passport → **128bit family account**: Continue with Google, Continue with Apple, or email, the
same account as 128bitPlay, 128bitfit and 128bit Tracker. Signed in, every `emitEvent` in
[`app/src/events.ts`](app/src/events.ts) (quests, packing, bookings, check-ins) goes to the family
feed via [`app/src/family.ts`](app/src/family.ts), so it shows on Tracker's timeline and reaches
128bitlife. Events wait in an outbox when offline; nothing is collected while signed out.
Delete account is in the same panel. Feed schema: 128bittracker's `docs/EVENTS.md`.

Google and Apple need `bit128trip://auth-callback` in Supabase → Authentication → URL
Configuration → Redirect URLs.
