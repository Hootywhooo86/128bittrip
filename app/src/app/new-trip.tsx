import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { CostTable } from '@/components/game';
import { Body, Chip, Eyebrow, Field, Panel, PixelButton, PixelText, Row, Screen, Stepper } from '@/components/pixel';
import { Colors, Spacing } from '@/constants/theme';
import { DESTINATIONS, getDestination } from '@/data/destinations';
import { useGame } from '@/game/store';
import { estimateTrip } from '@/services/prices';

function dateInMonths(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00`).getTime());

export default function NewTripScreen() {
  const { state, createTrip } = useGame();
  const params = useLocalSearchParams<{
    destinationId?: string;
    nights?: string;
    travelers?: string;
    includeCar?: string;
    experienceIds?: string;
    origin?: string;
  }>();

  const [destinationId, setDestinationId] = useState(params.destinationId ?? '');
  const [search, setSearch] = useState('');
  const [origin, setOrigin] = useState(params.origin ?? state.settings.homeAirport);
  const [departDate, setDepartDate] = useState(dateInMonths(3));
  const [nights, setNights] = useState(Number(params.nights) || 5);
  const [travelers, setTravelers] = useState(Number(params.travelers) || 2);
  const [includeCar, setIncludeCar] = useState(params.includeCar === '1');
  const [experienceIds, setExperienceIds] = useState<string[]>(
    params.experienceIds ? params.experienceIds.split(',').filter(Boolean) : [],
  );

  const dest = getDestination(destinationId);
  const matches = DESTINATIONS.filter((d) =>
    `${d.city} ${d.country} ${d.iata}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const cost = useMemo(
    () =>
      dest
        ? estimateTrip({
            destinationId: dest.id,
            origin: origin || state.settings.homeAirport,
            nights,
            travelers,
            includeCar: includeCar && dest.carDay > 0,
            experienceIds,
            currency: state.settings.currency,
          })
        : null,
    [dest, origin, nights, travelers, includeCar, experienceIds, state.settings],
  );

  const pickDestination = (id: string) => {
    setDestinationId(id);
    setExperienceIds([]);
    setIncludeCar(false);
  };

  const toggleExperience = (id: string) =>
    setExperienceIds((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));

  const validOrigin = /^[A-Za-z]{3}$/.test(origin.trim());
  const canCreate = !!dest && isDate(departDate) && validOrigin;

  const accept = () => {
    if (!dest || !canCreate) return;
    const id = createTrip({
      destinationId: dest.id,
      origin: origin.trim(),
      departDate,
      nights,
      travelers,
      includeCar: includeCar && dest.carDay > 0,
      experienceIds,
    });
    router.replace({ pathname: '/trip/[id]', params: { id } });
  };

  return (
    <Screen>
      <Eyebrow>1 · PICK YOUR BOSS</Eyebrow>
      {dest ? (
        <Panel accent={Colors.pink} onPress={() => setDestinationId('')}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={{ gap: 4, flex: 1 }}>
              <PixelText size={11}>{dest.city.toUpperCase()}</PixelText>
              <Body size={13} tone="muted">
                {dest.country} · Boss: {dest.boss.name}
              </Body>
            </View>
            <Body size={32}>{dest.boss.emoji}</Body>
          </Row>
          <PixelText size={7} tone="teal">
            TAP TO CHANGE
          </PixelText>
        </Panel>
      ) : (
        <>
          <Field label="SEARCH DESTINATIONS" value={search} onChangeText={setSearch} placeholder="Tokyo, beach, LAS…" />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            {matches.map((d) => (
              <Chip key={d.id} label={`${d.boss.emoji} ${d.city}`} onPress={() => pickDestination(d.id)} />
            ))}
          </View>
        </>
      )}

      {dest && cost && (
        <>
          <Eyebrow>2 · TRIP DETAILS</Eyebrow>
          <Row style={{ alignItems: 'flex-start' }}>
            <Field
              label="FROM (AIRPORT)"
              value={origin}
              onChangeText={(v) => setOrigin(v.toUpperCase())}
              autoCapitalize="characters"
              maxLength={3}
            />
            <Field label="LEAVE (YYYY-MM-DD)" value={departDate} onChangeText={setDepartDate} maxLength={10} />
          </Row>
          <Row>
            {[1, 3, 6].map((m) => (
              <Chip key={m} label={`+${m} mo`} active={departDate === dateInMonths(m)} onPress={() => setDepartDate(dateInMonths(m))} />
            ))}
          </Row>
          <Row>
            <Stepper label="NIGHTS" value={nights} onChange={setNights} max={30} />
            <Stepper label="TRAVELERS" value={travelers} onChange={setTravelers} max={9} />
          </Row>

          <Eyebrow>3 · LOADOUT</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            {dest.carDay > 0 && <Chip label="🚗 Rental car" active={includeCar} onPress={() => setIncludeCar((v) => !v)} />}
            {dest.experiences.map((e) => (
              <Chip key={e.id} label={`🎟️ ${e.name}`} active={experienceIds.includes(e.id)} onPress={() => toggleExperience(e.id)} />
            ))}
          </View>

          <Panel accent={Colors.orange}>
            <Eyebrow tone="orange">BOSS HP (ESTIMATE)</Eyebrow>
            <CostTable cost={cost} currency={state.settings.currency} />
            <Body size={12} tone="muted">
              Estimates for planning. Refresh on the trip screen for live fares where available.
            </Body>
          </Panel>

          {!validOrigin && <Body tone="pink">Enter a 3-letter airport code (e.g. YEG).</Body>}
          {!isDate(departDate) && <Body tone="pink">Enter the date as YYYY-MM-DD.</Body>}
          <PixelButton label="ACCEPT QUEST ⚔" onPress={accept} disabled={!canCreate} />
        </>
      )}
    </Screen>
  );
}
