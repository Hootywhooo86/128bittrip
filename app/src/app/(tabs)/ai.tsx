import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CostTable } from '@/components/game';
import { Body, Chip, Eyebrow, Field, Panel, PixelButton, PixelText, Row, Screen, Stepper } from '@/components/pixel';
import { Colors, Spacing } from '@/constants/theme';
import { Vibe, VIBES } from '@/data/destinations';
import { useGame } from '@/game/store';
import { formatMoney } from '@/services/prices';
import { cheapestTrip, planTrips, PlanResult, TripPlan } from '@/services/trip-ai';

export default function TripAiScreen() {
  const { state } = useGame();
  const currency = state.settings.currency;
  const [budget, setBudget] = useState('');
  const [origin, setOrigin] = useState(state.settings.homeAirport);
  const [travelers, setTravelers] = useState(2);
  const [nights, setNights] = useState(0);
  const [vibes, setVibes] = useState<Vibe[]>([]);
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<PlanResult | null>(null);
  const [thinking, setThinking] = useState(false);
  const plans = result?.plans;
  const [floor, setFloor] = useState<{ city: string; total: number } | null>(null);

  const toggleVibe = (v: Vibe) => setVibes((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  const build = async () => {
    const req = { budget: Number(budget), currency, origin, travelers, nights: nights || undefined, vibes, notes: notes.trim() || undefined };
    setThinking(true);
    const next = await planTrips(req);
    setThinking(false);
    setResult(next);
    const cheapest = next.plans.length === 0 ? cheapestTrip(req) : null;
    setFloor(cheapest ? { city: cheapest.dest.city, total: cheapest.total } : null);
  };

  const accept = (p: TripPlan) =>
    router.push({
      pathname: '/new-trip',
      params: {
        destinationId: p.spec.destinationId,
        nights: String(p.spec.nights),
        travelers: String(p.spec.travelers),
        includeCar: p.spec.includeCar ? '1' : '0',
        experienceIds: p.spec.experienceIds.join(','),
        origin: p.spec.origin,
      },
    });

  return (
    <Screen>
      <Eyebrow>✦ TRIP AI</Eyebrow>
      <PixelText size={18}>What can I afford?</PixelText>
      <Body tone="muted">Tell Trip AI what you can spend. It builds trips that fit — flights, stay, car, side quests and all.</Body>

      <Panel accent={Colors.teal}>
        <Row style={{ alignItems: 'flex-start' }}>
          <Field
            label={`BUDGET (${currency})`}
            value={budget}
            onChangeText={(v) => setBudget(v.replace(/[^0-9]/g, ''))}
            placeholder="3000"
            keyboardType="number-pad"
            inputMode="numeric"
          />
          <Field label="FROM" value={origin} onChangeText={(v) => setOrigin(v.toUpperCase())} maxLength={3} autoCapitalize="characters" />
        </Row>
        <Row>
          <Stepper label="TRAVELERS" value={travelers} onChange={setTravelers} max={9} />
          <Stepper label={nights ? 'NIGHTS' : 'NIGHTS (AUTO)'} value={nights} onChange={setNights} min={0} max={21} />
        </Row>
        <PixelText size={8} tone="muted">
          VIBE
        </PixelText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
          {VIBES.map((v) => (
            <Chip key={v.id} label={`${v.emoji} ${v.label}`} active={vibes.includes(v.id)} onPress={() => toggleVibe(v.id)} />
          ))}
        </View>
        <Field
          label="ANYTHING ELSE? (OPTIONAL)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Warm in December, short flights, kid-friendly…"
          maxLength={500}
          multiline
        />
        <PixelButton
          label={thinking ? 'TRIP AI IS THINKING…' : 'BUILD MY TRIP ✦'}
          onPress={build}
          disabled={thinking || !(Number(budget) > 0) || origin.length !== 3}
        />
      </Panel>

      {result && result.plans.length > 0 && (
        <PixelText size={7} tone="muted">
          {result.source === 'ai' ? '✦ PLANNED BY TRIP AI · PRICES ARE ESTIMATES' : 'QUICK PLANS (OFFLINE) · PRICES ARE ESTIMATES'}
        </PixelText>
      )}

      {plans && plans.length === 0 && (
        <Panel accent={Colors.pink}>
          <Body>Nothing fits that budget yet.</Body>
          {floor && (
            <Body tone="muted">
              The cheapest quest from {origin} is about {formatMoney(floor.total, currency)} ({floor.city}, 3 nights). Start
              saving toward it — Trip AI will be here.
            </Body>
          )}
        </Panel>
      )}

      {plans?.map((p, i) => (
        <Panel key={p.dest.id} accent={i === 0 ? Colors.orange : undefined}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1, gap: 4 }}>
              {i === 0 && (
                <PixelText size={7} tone="orange">
                  ★ BEST MATCH
                </PixelText>
              )}
              <PixelText size={12}>{p.dest.city.toUpperCase()}</PixelText>
              <Body size={13} tone="muted">
                {p.pitch}
              </Body>
            </View>
            <Body size={32}>{p.dest.boss.emoji}</Body>
          </Row>
          {p.highlights.map((h) => (
            <Body key={h} size={13}>
              ⚔ {h}
            </Body>
          ))}
          <CostTable cost={p.cost} currency={currency} />
          <Body size={12} tone="teal">
            {formatMoney(p.leftover, currency)} left over
            {p.vibeMatches.length ? ` · ${p.vibeMatches.map((v) => VIBES.find((x) => x.id === v)?.label).join(', ')}` : ''}
          </Body>
          <PixelButton label="ACCEPT QUEST →" small variant={i === 0 ? 'orange' : 'teal'} onPress={() => accept(p)} />
        </Panel>
      ))}
    </Screen>
  );
}
