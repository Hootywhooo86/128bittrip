import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { BossCard, CostTable, QuestRow } from '@/components/game';
import { Body, Chip, Eyebrow, Field, Panel, PixelButton, PixelText, Row, Screen } from '@/components/pixel';
import { Colors, Spacing } from '@/constants/theme';
import { getDestination } from '@/data/destinations';
import { bossFor, CATEGORY_META, daysUntil, questsFor, tripCategories } from '@/game/quests';
import { useGame, useTrip } from '@/game/store';
import { linkFor } from '@/services/affiliates';
import { GOLD_AVAILABLE } from '@/services/gold';
import { Category, formatMoney } from '@/services/prices';

export default function TripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const trip = useTrip(id);
  const { setSaved, claimBooking, refreshPrices, checkIn, deleteTrip } = useGame();
  const [amount, setAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [opened, setOpened] = useState<Partial<Record<Category, boolean>>>({});

  const dest = trip && getDestination(trip.destinationId);
  if (!trip || !dest) {
    return (
      <Screen>
        <Body tone="muted">This trip is gone.</Body>
        <PixelButton label="BACK" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }

  const boss = bossFor(trip);
  const days = daysUntil(trip.departDate);
  const quests = questsFor(trip);
  const target = { dest, origin: trip.origin, departDate: trip.departDate, nights: trip.nights, travelers: trip.travelers };

  const strike = (total: number) => {
    setSaved(trip.id, total);
    setAmount('');
  };

  const openPartner = (c: Category) => {
    Linking.openURL(linkFor(c, target));
    setOpened((prev) => ({ ...prev, [c]: true }));
  };

  const refresh = async () => {
    setRefreshing(true);
    await refreshPrices(trip.id);
    setRefreshing(false);
  };

  const lastPrice = trip.priceHistory[trip.priceHistory.length - 1];

  return (
    <Screen>
      <Stack.Screen options={{ title: dest.city.toUpperCase() }} />
      <BossCard trip={trip} />
      <Body size={13} tone="muted">
        {trip.origin} → {dest.iata} · {trip.departDate} · {trip.nights} nights · {trip.travelers} traveler
        {trip.travelers > 1 ? 's' : ''}
      </Body>

      {/* ATTACK: savings = damage */}
      <Panel accent={Colors.orange}>
        <Eyebrow tone="orange">⚔ ATTACK · AMOUNT SAVED</Eyebrow>
        {GOLD_AVAILABLE && trip.savingsSource === 'gold' ? (
          <Body tone="muted">Synced from 128bitgold.</Body>
        ) : (
          <>
            <Body size={13} tone="muted">
              Enter the total you&apos;ve saved for this trip. Every dollar is damage.
            </Body>
            <PixelText size={8} tone="teal">
              SAVED SO FAR: {formatMoney(trip.saved, trip.currency)}
            </PixelText>
            <Row style={{ alignItems: 'flex-end' }}>
              <Field
                label={`TOTAL SAVED (${trip.currency})`}
                value={amount}
                onChangeText={(v) => setAmount(v.replace(/[^0-9.]/g, ''))}
                placeholder="e.g. 1200"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
              <PixelButton label="STRIKE" small disabled={amount === ''} onPress={() => strike(Number(amount))} />
            </Row>
            <Row style={{ flexWrap: 'wrap', gap: Spacing.two }}>
              {[50, 100, 250, 500].map((n) => (
                <Chip key={n} label={`+${n}`} onPress={() => strike(trip.saved + n)} />
              ))}
            </Row>
            <Body size={12} tone="muted">
              Link 128bitgold (coming soon) to sync your savings automatically.
            </Body>
          </>
        )}
      </Panel>

      {/* BOOKING BUNDLE */}
      <Panel accent={boss.defeated ? Colors.teal : undefined}>
        <Eyebrow tone={boss.defeated ? 'teal' : 'muted'}>
          {boss.defeated ? '🏆 BUNDLE UNLOCKED · BOOK IT ALL' : 'BOOKING BUNDLE'}
        </Eyebrow>
        {!boss.defeated && (
          <Body size={12} tone="muted">
            Book whenever you&apos;re ready — prices move, so lock in deals early.
          </Body>
        )}
        {tripCategories(trip).map((c) => (
          <View key={c} style={{ gap: Spacing.two, paddingVertical: Spacing.one }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Body weight="semi">
                {CATEGORY_META[c].emoji} {CATEGORY_META[c].label}
              </Body>
              <Body size={13} tone="muted">
                {formatMoney(trip.cost[c], trip.currency)}
              </Body>
            </Row>
            {trip.booked[c] ? (
              <PixelText size={8} tone="teal">
                ✓ BOOKED
              </PixelText>
            ) : (
              <Row>
                <PixelButton label="BOOK →" small variant="teal" style={{ flex: 1 }} onPress={() => openPartner(c)} />
                {opened[c] && (
                  <PixelButton label="I BOOKED IT ✓" small style={{ flex: 1 }} onPress={() => claimBooking(trip.id, c)} />
                )}
              </Row>
            )}
          </View>
        ))}
      </Panel>

      {/* PRICES */}
      <Panel>
        <Row style={{ justifyContent: 'space-between' }}>
          <Eyebrow>PRICE INTEL</Eyebrow>
          <PixelText size={7} tone={trip.priceSource === 'live' ? 'teal' : 'muted'}>
            {trip.priceSource === 'live' ? '● LIVE FARE' : 'ESTIMATE'}
          </PixelText>
        </Row>
        <CostTable cost={trip.cost} currency={trip.currency} />
        <Body size={12} tone="muted">
          Updated {new Date(lastPrice.at).toLocaleString()}
        </Body>
        <PixelButton label={refreshing ? 'SCANNING…' : 'REFRESH PRICES'} small variant="ghost" disabled={refreshing} onPress={refresh} />
      </Panel>

      {/* QUESTS */}
      <Eyebrow>QUEST LOG</Eyebrow>
      {quests.map((q) => (
        <QuestRow key={q.id} quest={q} />
      ))}

      {days <= 0 && !trip.checkedIn && <PixelButton label="I LANDED · CHECK IN ✈" variant="pink" onPress={() => checkIn(trip.id)} />}

      <PixelButton
        label={confirmDelete ? 'TAP AGAIN TO ABANDON' : 'ABANDON QUEST'}
        variant="ghost"
        small
        onPress={() => {
          if (!confirmDelete) return setConfirmDelete(true);
          deleteTrip(trip.id);
          router.back();
        }}
      />
    </Screen>
  );
}
