import { FlatList, StyleSheet, Text, View } from 'react-native';
import { base, colors, fonts } from '../theme';


const STAMPS = [
  { id: 'yeg', city: 'Edmonton', country: 'Canada', got: true },
  { id: 'ana', city: 'Anaheim', country: 'USA', got: false },
  { id: 'banff', city: 'Banff', country: 'Canada', got: true },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', got: false },
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
          <View style={[s.stamp, { borderColor: item.got ? colors.accent : colors.border }, !item.got && s.stampLocked]}>
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
  wrap: base.wrap,
  hero: base.hero,
  eyebrow: base.eyebrow,
  title: base.title,
  xp: base.xp,
  list: { padding: 16, gap: 12 },
  row: { gap: 12 },
  stamp: { flex: 1, borderWidth: 3, borderStyle: 'dashed', padding: 22, alignItems: 'center', gap: 4, backgroundColor: colors.surface },
  stampLocked: { opacity: 0.45 },
  stampCity: { fontFamily: fonts.pixel, color: colors.text, fontSize: 10, textAlign: 'center' },
  stampCountry: { color: colors.textMuted, fontSize: 12 },
  dim: { color: colors.textMuted },
  note: { color: colors.textMuted, fontSize: 12, textAlign: 'center', padding: 16 },
});
