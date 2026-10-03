import { useState } from 'react';
import { Linking, View } from 'react-native';

import { Body, Chip, Eyebrow, Field, Panel, PixelButton, PixelText, Row, Screen } from '@/components/pixel';
import { Colors, Spacing } from '@/constants/theme';
import { DESTINATIONS, getDestination } from '@/data/destinations';
import { CATEGORIES, CATEGORY_META } from '@/game/quests';
import { useGame } from '@/game/store';
import {
  carSearchLink,
  esimLink,
  experienceSearchLink,
  flightSearchLink,
  hotelSearchLink,
  linkFor,
} from '@/services/affiliates';
import { Category } from '@/services/prices';

const PARTNER_NOTE: Record<Category, string> = {
  flight: 'Compare fares across airlines',
  hotel: 'Hotels, resorts & apartments',
  car: 'Rental cars at the airport or in town',
  esim: 'Data the moment you land — no roaming bills',
  experience: 'Tours, tickets & things to do',
};

export default function BookScreen() {
  const { state } = useGame();
  const [tripId, setTripId] = useState<string | null>(null);
  const [where, setWhere] = useState('');
  const [toAirport, setToAirport] = useState('');
  const [origin, setOrigin] = useState(state.settings.homeAirport);

  const trip = state.trips.find((t) => t.id === tripId);
  const tripDest = trip && getDestination(trip.destinationId);
  const catalogMatch = DESTINATIONS.find((d) => d.city.toLowerCase() === where.trim().toLowerCase());
  const destAirport = (toAirport || catalogMatch?.iata || '').toUpperCase();

  const linkForCategory = (c: Category): string | null => {
    if (trip && tripDest) {
      return linkFor(c, { dest: tripDest, origin: trip.origin, departDate: trip.departDate, nights: trip.nights, travelers: trip.travelers });
    }
    const place = where.trim();
    switch (c) {
      case 'flight':
        return destAirport.length === 3 && origin.length === 3 ? flightSearchLink(origin, destAirport) : null;
      case 'hotel':
        return place ? hotelSearchLink(place) : null;
      case 'car':
        return place ? carSearchLink(place) : null;
      case 'esim':
        return esimLink();
      case 'experience':
        return place ? experienceSearchLink(place) : null;
    }
  };

  return (
    <Screen>
      <Eyebrow>ALL-IN-ONE BOOKING</Eyebrow>
      <PixelText size={18}>Book it</PixelText>
      <Body tone="muted">
        Flights, hotels, cars, eSIMs and experiences in one place. Book from a trip to earn quest XP.
      </Body>

      {state.trips.length > 0 && (
        <>
          <Eyebrow tone="muted">BOOK FOR A TRIP</Eyebrow>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
            {state.trips.map((t) => (
              <Chip
                key={t.id}
                label={`${getDestination(t.destinationId)?.boss.emoji ?? ''} ${getDestination(t.destinationId)?.city ?? t.destinationId}`}
                active={t.id === tripId}
                onPress={() => setTripId(t.id === tripId ? null : t.id)}
              />
            ))}
          </View>
        </>
      )}

      {trip && tripDest ? (
        <Panel accent={Colors.teal}>
          <Body weight="semi">
            {trip.origin} → {tripDest.city} · {trip.departDate} · {trip.nights} nights · {trip.travelers} traveler
            {trip.travelers > 1 ? 's' : ''}
          </Body>
          <Body size={12} tone="muted">
            Searches are pre-filled from this trip. Mark bookings done on the trip screen for XP.
          </Body>
        </Panel>
      ) : (
        <Panel>
          <Field label="WHERE TO?" value={where} onChangeText={setWhere} placeholder="City, e.g. Lisbon" />
          <Row style={{ alignItems: 'flex-start' }}>
            <Field label="FROM" value={origin} onChangeText={(v) => setOrigin(v.toUpperCase())} maxLength={3} autoCapitalize="characters" />
            <Field
              label="TO (AIRPORT)"
              value={toAirport || catalogMatch?.iata || ''}
              onChangeText={(v) => setToAirport(v.toUpperCase())}
              maxLength={3}
              autoCapitalize="characters"
              placeholder="LIS"
            />
          </Row>
        </Panel>
      )}

      {CATEGORIES.map((c) => {
        const url = linkForCategory(c);
        return (
          <Panel key={c}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Body weight="bold">
                  {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
                </Body>
                <Body size={12} tone="muted">
                  {PARTNER_NOTE[c]}
                </Body>
              </View>
              <PixelButton
                label="SEARCH →"
                small
                variant={c === 'flight' || c === 'hotel' ? 'orange' : 'teal'}
                disabled={!url}
                onPress={() => url && Linking.openURL(url)}
              />
            </Row>
          </Panel>
        );
      })}

      <Body size={11} tone="muted" style={{ textAlign: 'center' }}>
        Bookings are completed with our travel partners. 128bit Trips may earn a commission at no extra cost to you.
      </Body>
    </Screen>
  );
}
