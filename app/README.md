# 128bittrip — app

The gamified trip planner. Quests, not itineraries. Part of the 128bit family.

Scaffolded by Rocky (Expo SDK 57 + expo-router, same major as 128bitfit).
Features get built with Carlos (Claude Code).

## Run it

```bash
cd app
npx expo install   # always use expo install, never npm add (SDK version pinning)
npx expo start
```

Scan the QR with Expo Go, or press `a` / `i` for an emulator.

Before calling anything done: `npx expo lint` and `npx tsc --noEmit`.

## Structure

```
app/
├── src/app/
│   ├── index.tsx        # Quests — today's missions + XP
│   ├── checklist.tsx    # Pre-departure checklist (eSIM quest included)
│   ├── book.tsx         # Affiliate booking links (hotels, flights)
│   ├── passport.tsx     # Pixel stamps + traveler level
│   └── _layout.tsx      # root layout
├── src/components/app-tabs.tsx  # native tab bar (4 tabs, pixel icons)
├── src/
│   ├── events.ts        # ★ 128bit shared event schema — keep in sync across apps
│   └── affiliates.ts    # Affiliate link builders (fill in IDs as approved)
├── assets/images/tabIcons/  # pixel tab icons (quests, checklist, book, passport)
└── app.json             # name/slug/scheme/bundle ids
```

## The 128bit contract

`src/events.ts` is the shared event schema every 128bit app emits
(`trip.created`, `booking.made`, `esim.purchased`, …). 128bitlife subscribes
to the feed and turns events into quests, XP, and suggestions. **Do not**
silo app data — emit events for everything the other apps might care about.

`src/affiliates.ts` holds every affiliate ID in one place. Until IDs are
filled in, all booking buttons degrade to plain deep links — nothing breaks.

## Affiliate signup checklist

1. Travelpayouts (travelpayouts.com) → join Aviasales, Hotellook, Viator, GetYourGuide
2. Booking.com via Awin → fill `awinPublisherId` + `bookingAwinMid`
3. Airalo → ✅ live via Travelpayouts (`airaloLink`)
4. Undercover Tourist (Disney tickets)
5. Expedia Travel Redirect API (while Rapid is paused)
6. Duffel (duffel.com) — real flight booking API, when ready

Canadians: file a W-8BEN with each US program or lose 30% withholding.
