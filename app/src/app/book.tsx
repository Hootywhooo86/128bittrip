import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { bookingComLink, flightSearchLink, hotelSearchLink } from '../affiliates';
import { emitEvent } from '../events';
import { base, colors, fonts } from '../theme';


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
          placeholderTextColor={colors.textMuted}
        />

        <Pressable style={s.btn} onPress={() => open(hotelSearchLink(dest), 'hotel')}>
          <Text style={s.btnText}>FIND HOTELS →</Text>
        </Pressable>
        <Pressable style={[s.btn, s.btnAlt]} onPress={() => open(bookingComLink(dest), 'bookingcom')}>
          <Text style={[s.btnText, s.btnAltText]}>BOOKING.COM →</Text>
        </Pressable>
        <Pressable style={s.btn} onPress={() => open(flightSearchLink('YEG', 'SNA'), 'flight')}>
          <Text style={s.btnText}>FIND FLIGHTS YEG → SNA</Text>
        </Pressable>

        <Text style={s.note}>
          Hotels-first while we build: flights get the full in-app booking engine next (Duffel).
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: base.wrap,
  hero: base.hero,
  eyebrow: base.eyebrow,
  title: base.title,
  sub: { color: colors.textMuted, fontSize: 14, marginTop: 8, lineHeight: 20 },
  body: { padding: 16, gap: 12 },
  label: { fontFamily: fonts.pixel, color: colors.textMuted, fontSize: 8, letterSpacing: 1 },
  input: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.borderBright, color: colors.text, padding: 14, fontSize: 16 },
  btn: { backgroundColor: colors.accent, padding: 16, alignItems: 'center', marginTop: 4 },
  btnAlt: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.accent },
  btnText: { fontFamily: fonts.pixel, color: colors.onAccent, fontSize: 10 },
  btnAltText: { color: colors.accent },
  note: { color: colors.textMuted, fontSize: 12, marginTop: 16, lineHeight: 18, textAlign: 'center' },
});
