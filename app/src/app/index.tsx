import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { emitEvent } from '../events';
import { base, colors, fonts } from '../theme';


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
  wrap: base.wrap,
  hero: base.hero,
  eyebrow: base.eyebrow,
  title: base.title,
  xp: base.xp,
  list: { padding: 16, gap: 12 },
  card: { ...base.card, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardDone: { borderColor: colors.borderBright, opacity: 0.6 },
  check: { width: 26, height: 26, borderWidth: 2, borderColor: colors.textMuted, alignItems: 'center', justifyContent: 'center' },
  checkDone: { borderColor: colors.accent, backgroundColor: colors.accent },
  checkMark: { color: colors.onAccent, fontWeight: '800' },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through', color: colors.textMuted },
  cardDetail: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  cardXp: { fontFamily: fonts.pixel, color: colors.accent, fontSize: 9 },
});
