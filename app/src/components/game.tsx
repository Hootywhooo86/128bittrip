import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { getDestination } from '@/data/destinations';
import { levelInfo } from '@/game/levels';
import { bossFor, CATEGORY_META, daysUntil, Quest } from '@/game/quests';
import { Reward, Trip, useGame } from '@/game/store';
import { CostBreakdown, Currency, formatMoney } from '@/services/prices';

import { Bar, Body, Panel, PixelText, Row } from './pixel';

export function PlayerCard() {
  const { state } = useGame();
  const lvl = levelInfo(state.xp);
  return (
    <Panel accent={Colors.teal}>
      <Row style={{ justifyContent: 'space-between' }}>
        <PixelText size={10} tone="teal">
          LV {lvl.level} · {lvl.title.toUpperCase()}
        </PixelText>
        <PixelText size={9} tone="orange">
          {state.xp.toLocaleString('en-US')} XP
        </PixelText>
      </Row>
      <Bar pct={lvl.into / lvl.span} color={Colors.orange} />
      <Body size={12} tone="muted">
        {lvl.span - lvl.into} XP to level {lvl.level + 1}
      </Body>
    </Panel>
  );
}

export function BossCard({ trip, compact }: { trip: Trip; compact?: boolean }) {
  const dest = getDestination(trip.destinationId);
  const boss = bossFor(trip);
  const days = daysUntil(trip.departDate);
  return (
    <Panel
      accent={boss.defeated ? Colors.teal : Colors.pink}
      onPress={compact ? () => router.push({ pathname: '/trip/[id]', params: { id: trip.id } }) : undefined}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <PixelText size={8} tone="muted">
            {dest?.city.toUpperCase()} · {days > 0 ? `${days} DAYS OUT` : days === 0 ? 'TODAY!' : 'TRIP STARTED'}
          </PixelText>
          <PixelText size={compact ? 11 : 13} tone={boss.defeated ? 'teal' : 'ink'}>
            {boss.name}
          </PixelText>
        </View>
        <Body size={compact ? 28 : 40}>{boss.defeated ? '🏆' : boss.emoji}</Body>
      </Row>
      <Row style={{ justifyContent: 'space-between' }}>
        <PixelText size={8} tone="pink">
          HP
        </PixelText>
        <PixelText size={8} tone="muted">
          {formatMoney(boss.hp, trip.currency)} / {formatMoney(boss.maxHp, trip.currency)}
        </PixelText>
      </Row>
      <Bar pct={boss.pct} color={boss.pct > 0.5 ? Colors.pink : boss.pct > 0.2 ? Colors.orange : Colors.teal} />
      {compact && (
        <Body size={12} tone="muted">
          {boss.defeated ? 'Defeated! Booking bundle unlocked →' : `Saved ${formatMoney(trip.saved, trip.currency)} · tap to fight →`}
        </Body>
      )}
    </Panel>
  );
}

export function QuestRow({ quest, onPress, cta }: { quest: Quest; onPress?: () => void; cta?: string }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.quest, quest.done && styles.questDone, pressed && { opacity: 0.75 }]}>
      <View style={[styles.check, quest.done && styles.checkDone]}>
        {quest.done && (
          <PixelText size={9} tone="onBright">
            ✓
          </PixelText>
        )}
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Body weight="bold" size={14} style={quest.done && styles.strike}>
          {quest.category ? `${CATEGORY_META[quest.category].emoji} ` : ''}
          {quest.title}
        </Body>
        <Body size={12} tone="muted">
          {quest.detail}
        </Body>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 4 }}>
        <PixelText size={8} tone="orange">
          +{quest.xp}
        </PixelText>
        {cta && !quest.done && (
          <PixelText size={7} tone="teal">
            {cta}
          </PixelText>
        )}
      </View>
    </Pressable>
  );
}

const COST_LINES: { key: keyof CostBreakdown; label: string }[] = [
  { key: 'flight', label: '✈️ Flights' },
  { key: 'hotel', label: '🏨 Hotel' },
  { key: 'car', label: '🚗 Car' },
  { key: 'esim', label: '📶 eSIM' },
  { key: 'experience', label: '🎟️ Experiences' },
  { key: 'spending', label: '🍜 Food & getting around' },
];

export function CostTable({ cost, currency }: { cost: CostBreakdown; currency: Currency }) {
  return (
    <View style={{ gap: 6 }}>
      {COST_LINES.filter((l) => cost[l.key] > 0).map((l) => (
        <Row key={l.key} style={{ justifyContent: 'space-between' }}>
          <Body size={13} tone="muted">
            {l.label}
          </Body>
          <Body size={13} weight="semi">
            {formatMoney(cost[l.key], currency)}
          </Body>
        </Row>
      ))}
      <View style={{ height: 2, backgroundColor: Colors.line, marginVertical: 4 }} />
      <Row style={{ justifyContent: 'space-between' }}>
        <PixelText size={9}>TOTAL</PixelText>
        <PixelText size={10} tone="orange">
          {formatMoney(cost.total, currency)}
        </PixelText>
      </Row>
    </View>
  );
}

const REWARD_COLORS: Record<Reward['kind'], string> = {
  xp: Colors.orange,
  level: Colors.teal,
  crit: Colors.pink,
  heal: Colors.muted,
  boss: Colors.teal,
};

function RewardToast({ reward }: { reward: Reward }) {
  const { dismissReward } = useGame();
  useEffect(() => {
    const t = setTimeout(() => dismissReward(reward.id), reward.kind === 'level' || reward.kind === 'boss' ? 3500 : 2200);
    return () => clearTimeout(t);
  }, [reward, dismissReward]);
  return (
    <Animated.View entering={FadeInUp} exiting={FadeOutUp}>
      <Pressable onPress={() => dismissReward(reward.id)} style={[styles.toast, { borderColor: REWARD_COLORS[reward.kind] }]}>
        <PixelText size={10} style={{ color: REWARD_COLORS[reward.kind], textAlign: 'center' }}>
          {reward.title}
        </PixelText>
        {reward.detail && (
          <PixelText size={8} tone="ink" style={{ textAlign: 'center' }}>
            {reward.detail}
          </PixelText>
        )}
      </Pressable>
    </Animated.View>
  );
}

/** XP / level-up / crit popups, stacked at the top of the screen. */
export function RewardToasts() {
  const { rewards } = useGame();
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.toasts, { top: insets.top + Spacing.two }]}>
      {rewards.map((r) => (
        <RewardToast key={r.id} reward={r} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.panel,
    borderWidth: 2,
    borderColor: Colors.line,
    padding: 12,
  },
  questDone: { borderColor: Colors.tealDark, opacity: 0.7 },
  check: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: { borderColor: Colors.teal, backgroundColor: Colors.teal },
  strike: { textDecorationLine: 'line-through', color: Colors.muted },
  toasts: { position: 'absolute', left: 0, right: 0, alignItems: 'center', gap: Spacing.two, zIndex: 2000 },
  toast: {
    backgroundColor: Colors.bg,
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 18,
    gap: 6,
    minWidth: 220,
  },
});
