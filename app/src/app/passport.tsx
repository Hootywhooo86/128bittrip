import { FlatList, StyleSheet, Text, View } from 'react-native';

const COLORS = { bg: '#0b0b16', panel: '#141428', teal: '#2dd4bf', orange: '#ff9f1c', pink: '#ff5d8f', ink: '#f4f1ff', muted: '#9a97b8' };

const STAMPS = [
  { id: 'yeg', city: 'Edmonton', country: 'Canada', got: true, color: COLORS.teal },
  { id: 'ana', city: 'Anaheim', country: 'USA', got: false, color: COLORS.orange },
  { id: 'banff', city: 'Banff', country: 'Canada', got: true, color: COLORS.pink },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', got: false, color: COLORS.muted },
];

const LEVELS = ['Wanderer', 'Voyager', 'Globetrotter', 'Legend'];

export default function PassportScreen() {
  const got = STAMPS.filter(s => s.got).length;
  return (
    <View style={s.wrap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>128BITLIFE SYNCED</Text>
        <Text style={s.title}>Passport</Text>
        <Text style={s.xp}>{got}/{STAMPS.length} stamps · Level: {LEVELS[Math.min(got, LEVELS.length - 1)]}</Text>
      </View>
      <FlatList
        data={STAMPS}
        keyExtractor={i => i.id}
        numColumns={2}
        contentContainerStyle={s.list}
        columnWrapperStyle={s.row}
        renderItem={({ item }) => (
          <View style={[s.stamp, { borderColor: item.got ? item.color : '#26264a' }, !item.got && s.stampLocked]}>
            <Text style={[s.stampCity, !item.got && s.dim]}>{item.got ? '★' : '☆'}</Text>
            <Text style={[s.stampCity, !item.got && s.dim]}>{item.city}</Text>
            <Text style={s.stampCountry}>{item.country}</Text>
          </View>
        )}
      />
      <Text style={s.note}>Check in on a trip to earn stamps. XP flows to 128bitlife.</Text>
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
  row: { gap: 12 },
  stamp: { flex: 1, borderWidth: 3, borderStyle: 'dashed', padding: 22, alignItems: 'center', gap: 4, backgroundColor: COLORS.panel },
  stampLocked: { opacity: 0.45 },
  stampCity: { color: COLORS.ink, fontWeight: '800', fontSize: 16 },
  stampCountry: { color: COLORS.muted, fontSize: 12 },
  dim: { color: COLORS.muted },
  note: { color: COLORS.muted, fontSize: 12, textAlign: 'center', padding: 16 },
});
