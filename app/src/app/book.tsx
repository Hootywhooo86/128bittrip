import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { bookingComLink, flightSearchLink, hotelSearchLink } from '../affiliates';
import { emitEvent } from '../events';

const COLORS = { bg: '#0b0b16', panel: '#141428', teal: '#2dd4bf', orange: '#ff9f1c', ink: '#f4f1ff', muted: '#9a97b8' };

export default function BookScreen() {
  const [dest, setDest] = useState('Anaheim');

  const open = (url: string, label: string) => {
    Linking.openURL(url);
    emitEvent({ name: 'booking.made', app: 'trip', userId: 'local', data: { via: label, destination: dest } });
  };

  return (
    <View style={s.wrap}>
      <View style={s.hero}>
        <Text style={s.eyebrow}>POWERED BY AFFILIATES</Text>
        <Text style={s.title}>Book it</Text>
        <Text style={s.sub}>Search below, book with our partners. Every booking earns trip XP.</Text>
      </View>

      <View style={s.body}>
        <Text style={s.label}>WHERE TO?</Text>
        <TextInput
          style={s.input}
          value={dest}
          onChangeText={setDest}
          placeholder="Anaheim"
          placeholderTextColor={COLORS.muted}
        />

        <Pressable style={s.btn} onPress={() => open(hotelSearchLink(dest), 'hotel')}>
          <Text style={s.btnText}>🏨 FIND HOTELS →</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnAlt]} onPress={() => open(bookingComLink(dest), 'bookingcom')}>
          <Text style={s.btnText}>🛏️ BOOKING.COM →</Text>
        </Pressable>
        <Pressable style={s.btn} onPress={() => open(flightSearchLink('YEG', 'SNA'), 'flight')}>
          <Text style={s.btnText}>✈️ FIND FLIGHTS (YEG → SNA) →</Text>
        </Pressable>

        <Text style={s.note}>
          Hotels-first while we build: flights get the full in-app booking engine next (Duffel).
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  hero: { padding: 24, paddingBottom: 8 },
  eyebrow: { color: COLORS.teal, fontSize: 11, letterSpacing: 2, marginBottom: 8, fontWeight: '700' },
  title: { color: COLORS.ink, fontSize: 28, fontWeight: '800' },
  sub: { color: COLORS.muted, fontSize: 14, marginTop: 8, lineHeight: 20 },
  body: { padding: 16, gap: 12 },
  label: { color: COLORS.muted, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  input: { backgroundColor: COLORS.panel, borderWidth: 2, borderColor: COLORS.teal, color: COLORS.ink, padding: 14, fontSize: 16 },
  btn: { backgroundColor: COLORS.orange, padding: 16, alignItems: 'center', marginTop: 4 },
  btnAlt: { backgroundColor: COLORS.teal },
  btnText: { color: '#101018', fontWeight: '800', fontSize: 14, letterSpacing: 1 },
  note: { color: COLORS.muted, fontSize: 12, marginTop: 16, lineHeight: 18, textAlign: 'center' },
});
