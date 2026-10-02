import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { emitEvent } from '../events';

const COLORS = { bg: '#0b0b16', panel: '#141428', teal: '#2dd4bf', orange: '#ff9f1c', ink: '#f4f1ff', muted: '#9a97b8' };

interface Quest { id: string; title: string; detail: string; xp: number; done: boolean; }

const STARTER_QUESTS: Quest[] = [
  { id: 'q1', title: 'Book the flight', detail: 'YEG → SNA · Oct 3', xp: 100, done: true },
  { id: 'q2', title: 'Grab your eSIM', detail: 'US data before you fly', xp: 40, done: false },
  { id: 'q3', title: 'Finish the packing list', detail: '12 items to go', xp: 80, done: false },
  { id: 'q4', title: 'Eat 5 Halloween foods', detail: 'Disneyland mission pack', xp: 50, done: false },
  { id: 'q5', title: 'Ride Haunted Mansion Holiday', detail: 'Disneyland mission pack', xp: 50, done: false },
];

export default function QuestsScreen() {
  const [quests, setQuests] = useState(STARTER_QUESTS);
  const xp = quests.filter(q => q.done).reduce((s, q) => s + q.xp, 0);

  const toggle = (id: string) => {
    setQuests(prev => prev.map(q => {
      if (q.id !== id) return q;
      const done = !q.done;
      if (done) emitEvent({ name: 'quest.completed', app: 'trip', userId: 'local', data: { questId: id } });
      return { ...q, done };
    }));
  };

  return (
    <View style={s.wrap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>DISNEYLAND · OCT 3–8</Text>
        <Text style={s.title}>Today's quests</Text>
        <Text style={s.xp}>{xp} XP earned</Text>
      </View>
      <FlatList
        data={quests}
        keyExtractor={q => q.id}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <Pressable onPress={() => toggle(item.id)} style={[s.card, item.done && s.cardDone]}>
            <View style={[s.check, item.done && s.checkDone]}>
              {item.done && <Text style={s.checkMark}>✓</Text>}
            </View>
            <View style={s.cardBody}>
              <Text style={[s.cardTitle, item.done && s.strike]}>{item.title}</Text>
              <Text style={s.cardDetail}>{item.detail}</Text>
            </View>
            <Text style={s.cardXp}>+{item.xp}</Text>
          </Pressable>
        )}
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
  list: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.panel, borderWidth: 2, borderColor: '#26264a', padding: 14, gap: 12 },
  cardDone: { borderColor: COLORS.teal, opacity: 0.75 },
  check: { width: 26, height: 26, borderWidth: 2, borderColor: COLORS.muted, alignItems: 'center', justifyContent: 'center' },
  checkDone: { borderColor: COLORS.teal, backgroundColor: COLORS.teal },
  checkMark: { color: '#0b0b16', fontWeight: '800' },
  cardBody: { flex: 1 },
  cardTitle: { color: COLORS.ink, fontSize: 15, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through', color: COLORS.muted },
  cardDetail: { color: COLORS.muted, fontSize: 12, marginTop: 2 },
  cardXp: { color: COLORS.orange, fontWeight: '800', fontSize: 13 },
});
