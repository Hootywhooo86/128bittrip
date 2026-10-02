import { useState } from 'react';
import { FlatList, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { esimLink } from '../affiliates';
import { emitEvent } from '../events';

const COLORS = { bg: '#0b0b16', panel: '#141428', teal: '#2dd4bf', orange: '#ff9f1c', ink: '#f4f1ff', muted: '#9a97b8' };

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
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  hero: { padding: 24, paddingBottom: 8 },
  eyebrow: { color: COLORS.teal, fontSize: 11, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  title: { color: COLORS.ink, fontSize: 28, fontWeight: '800' },
  xp: { color: COLORS.orange, fontSize: 14, marginTop: 6, fontWeight: '600' },
  bar: { height: 8, backgroundColor: '#26264a', marginTop: 12 },
  fill: { height: 8, backgroundColor: COLORS.teal },
  list: { padding: 16, gap: 12 },
  card: { backgroundColor: COLORS.panel, borderWidth: 2, borderColor: '#26264a', padding: 14 },
  cardDone: { borderColor: COLORS.teal, opacity: 0.75 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 26, height: 26, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  checkDone: { borderColor: COLORS.teal, backgroundColor: COLORS.teal },
  checkMark: { color: '#0b0b16', fontWeight: '800' },
  label: { color: COLORS.ink, fontSize: 15, fontWeight: '600', flex: 1 },
  strike: { textDecorationLine: 'line-through', color: COLORS.muted },
  action: { marginTop: 12, backgroundColor: COLORS.orange, padding: 12, alignItems: 'center' },
  actionText: { color: '#201100', fontWeight: '800', fontSize: 13, letterSpacing: 1 },
});
