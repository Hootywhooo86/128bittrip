import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PlayerCard } from '@/components/game';
import { Body, Chip, Eyebrow, Field, Panel, PixelButton, PixelText, Row, Screen } from '@/components/pixel';
import { Colors, Spacing } from '@/constants/theme';
import { DESTINATIONS } from '@/data/destinations';
import { useGame } from '@/game/store';
import { GOLD_AVAILABLE } from '@/services/gold';
import { localCurrency } from '@/services/locale';
import { CURRENCIES } from '@/services/prices';

const STAMP_COLORS = [Colors.teal, Colors.orange, Colors.pink];

const PLUS_PERKS = [
  'Unlimited active boss battles',
  'Faster live price alerts on every trip',
  'Trip AI deep plans — day-by-day quest packs',
  'Exclusive plane & hotel skins for your profile',
];

export default function PassportScreen() {
  const { state, updateSettings, resetGame } = useGame();
  const [home, setHome] = useState(state.settings.homeAirport);
  const [confirmReset, setConfirmReset] = useState(false);
  const stamped = new Set(state.stamps.map((s) => s.destinationId));
  const bosses = state.trips.filter((t) => t.bossDefeated).length;

  return (
    <Screen>
      <Eyebrow>TRAVELER PROFILE</Eyebrow>
      <PixelText size={18}>Passport</PixelText>
      <PlayerCard />

      <Row>
        <Panel style={{ flex: 1, alignItems: 'center' }}>
          <PixelText size={16} tone="teal">
            {state.stamps.length}
          </PixelText>
          <PixelText size={7} tone="muted">
            STAMPS
          </PixelText>
        </Panel>
        <Panel style={{ flex: 1, alignItems: 'center' }}>
          <PixelText size={16} tone="pink">
            {bosses}
          </PixelText>
          <PixelText size={7} tone="muted">
            BOSSES
          </PixelText>
        </Panel>
        <Panel style={{ flex: 1, alignItems: 'center' }}>
          <PixelText size={16} tone="orange">
            {state.trips.length}
          </PixelText>
          <PixelText size={7} tone="muted">
            QUESTS
          </PixelText>
        </Panel>
      </Row>

      <Eyebrow>STAMPS</Eyebrow>
      <View style={styles.grid}>
        {DESTINATIONS.map((d, i) => {
          const got = stamped.has(d.id);
          return (
            <View
              key={d.id}
              style={[styles.stamp, { borderColor: got ? STAMP_COLORS[i % STAMP_COLORS.length] : Colors.line }, !got && styles.locked]}>
              <Body size={22}>{got ? d.boss.emoji : '☆'}</Body>
              <PixelText size={7} style={{ textAlign: 'center' }}>
                {d.city.toUpperCase()}
              </PixelText>
            </View>
          );
        })}
      </View>
      <Body size={12} tone="muted" style={{ textAlign: 'center' }}>
        Check in when you land to earn a stamp. XP flows to 128bitlife.
      </Body>

      <Panel accent={Colors.orange}>
        <Eyebrow tone="orange">128BIT TRIPS+ · COMING SOON</Eyebrow>
        {PLUS_PERKS.map((p) => (
          <Body key={p} size={13}>
            ★ {p}
          </Body>
        ))}
      </Panel>

      <Panel>
        <Eyebrow>SETTINGS</Eyebrow>
        <Row style={{ alignItems: 'flex-end' }}>
          <Field label="HOME AIRPORT" value={home} onChangeText={(v) => setHome(v.toUpperCase())} maxLength={3} autoCapitalize="characters" />
          <PixelButton
            label="SAVE"
            small
            disabled={!/^[A-Z]{3}$/.test(home) || home === state.settings.homeAirport}
            onPress={() => updateSettings({ homeAirport: home })}
          />
        </Row>
        <PixelText size={8} tone="muted">
          CURRENCY (NEW TRIPS)
        </PixelText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two }}>
          <Chip
            label={`AUTO (${localCurrency()})`}
            active={state.settings.currencyAuto}
            onPress={() => updateSettings({ currencyAuto: true, currency: localCurrency() })}
          />
          {CURRENCIES.map((c) => (
            <Chip
              key={c}
              label={c}
              active={!state.settings.currencyAuto && state.settings.currency === c}
              onPress={() => updateSettings({ currencyAuto: false, currency: c })}
            />
          ))}
        </View>
        <PixelText size={8} tone="muted">
          128BITGOLD BUDGET SYNC
        </PixelText>
        <Body size={13} tone="muted">
          {GOLD_AVAILABLE
            ? 'Link 128bitgold to sync savings automatically.'
            : 'Coming soon. Until then, enter your savings on each trip.'}
        </Body>
        <PixelButton
          label={confirmReset ? 'TAP AGAIN TO WIPE PROGRESS' : 'RESET PROGRESS'}
          small
          variant="ghost"
          onPress={() => {
            if (!confirmReset) return setConfirmReset(true);
            resetGame();
            setConfirmReset(false);
          }}
        />
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  stamp: {
    width: '31%',
    flexGrow: 1,
    aspectRatio: 1,
    borderWidth: 3,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 4,
    backgroundColor: Colors.panel,
  },
  locked: { opacity: 0.4 },
});
