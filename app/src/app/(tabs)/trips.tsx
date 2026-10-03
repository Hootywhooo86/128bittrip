import { router } from 'expo-router';

import { BossCard } from '@/components/game';
import { Body, Eyebrow, Panel, PixelButton, PixelText, Screen } from '@/components/pixel';
import { useGame } from '@/game/store';

export default function TripsScreen() {
  const { state } = useGame();
  const trips = [...state.trips].sort((a, b) => a.departDate.localeCompare(b.departDate));
  const upcoming = trips.filter((t) => !t.checkedIn);
  const done = trips.filter((t) => t.checkedIn);

  return (
    <Screen>
      <Eyebrow>SAVED DESTINATIONS</Eyebrow>
      <PixelText size={18}>Trips</PixelText>
      <Body tone="muted">Every trip is a boss. Its HP is the live price; your savings are the damage.</Body>

      <PixelButton label="+ NEW QUEST" onPress={() => router.push('/new-trip')} />

      {upcoming.length === 0 && (
        <Panel>
          <Body tone="muted">No trips yet. Start one, or let Trip AI build one from your budget.</Body>
          <PixelButton label="ASK TRIP AI ✦" variant="teal" small onPress={() => router.push('/ai')} />
        </Panel>
      )}
      {upcoming.map((t) => (
        <BossCard key={t.id} trip={t} compact />
      ))}

      {done.length > 0 && (
        <>
          <Eyebrow tone="muted">COMPLETED</Eyebrow>
          {done.map((t) => (
            <BossCard key={t.id} trip={t} compact />
          ))}
        </>
      )}
    </Screen>
  );
}
