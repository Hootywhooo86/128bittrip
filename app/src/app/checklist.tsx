import { useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { esimLink } from '../affiliates';
import { emitEvent } from '../events';
import { base, colors, fonts } from '../theme';


interface Item { id: string; label: string; action?: { label: string; url: () => string; event: 'esim.purchased' }; }

const ITEMS: Item[] = [
  { id: 'passport', label: 'Passport (valid 6+ months)' },
  { id: 'esim', label: 'US eSIM installed', action: { label: 'GET ESIM →', url: esimLink, event: 'esim.purchased' } },
  { id: 'park', label: 'Park tickets + reservations' },
  { id: 'hotel', label: 'Hotel confirmation saved' },
  { id: 'charger', label: 'Chargers + battery pack' },
  { id: 'meds', label: 'Meds + first-aid basics' },
  { id: 'usd', label: 'USD spending money sorted' },
];

export default function ChecklistScreen() {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const count = Object.values(done).filter(Boolean).length;

  const toggle = (id: string) => {
    const next = !done[id];
    setDone(prev => ({ ...prev, [id]: next }));
    if (next && id === 'passport') emitEvent({ name: 'trip.packing.done', app: 'trip', userId: 'local' });
  };

  return (
    <View style={s.wrap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>PRE-DEPARTURE</Text>
        <Text style={s.title}>Checklist</Text>
        <Text style={s.xp}>{count}/{ITEMS.length} packed</Text>
        <View style={s.bar}><View style={[s.fill, { width: `${(count / ITEMS.length) * 100}%` }]} /></View>
      </View>
      <FlatList
        data={ITEMS}
        keyExtractor={i => i.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => {
          const isDone = !!done[item.id];
          return (
            <View style={[s.card, isDone && s.cardDone]}>
              <Pressable onPress={() => toggle(item.id)} style={s.row}>
                <View style={[s.check, isDone && s.checkDone]}>
                  {isDone && <Text style={s.checkMark}>✓</Text>}
                </View>
                <Text style={[s.label, isDone && s.strike]}>{item.label}</Text>
              </Pressable>
              {item.action && !isDone && (
                <Pressable
                  style={s.action}
                  onPress={() => {
                    Linking.openURL(item.action!.url());
                    emitEvent({ name: item.action!.event, app: 'trip', userId: 'local' });
                    toggle(item.id);
                  }}
                >
                  <Text style={s.actionText}>{item.action.label}</Text>
                </Pressable>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: base.wrap,
  hero: base.hero,
  eyebrow: base.eyebrow,
  title: base.title,
  xp: base.xp,
  bar: { height: 8, backgroundColor: colors.track, marginTop: 12 },
  fill: { height: 8, backgroundColor: colors.accent },
  list: { padding: 16, gap: 12 },
  card: base.card,
  cardDone: { borderColor: colors.borderBright, opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 26, height: 26, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  checkDone: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { color: colors.onAccent, fontWeight: '800' },
  label: { color: colors.text, fontSize: 15, fontWeight: '600', flex: 1 },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  action: { marginTop: 12, backgroundColor: colors.accent, padding: 12, alignItems: 'center' },
  actionText: { fontFamily: fonts.pixel, color: colors.onAccent, fontSize: 10 },
});
