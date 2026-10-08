import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import {
  deleteFamilyAccount,
  familyEmail,
  onFamily,
  signInEmail,
  signInWith,
  signOutFamily,
  signUpEmail,
} from '@/family';

const C = { panel: '#141428', line: '#26264a', teal: '#2dd4bf', orange: '#ff9f1c', pink: '#ff5d8f', ink: '#f4f1ff', muted: '#9a97b8', bg: '#0b0b16' };

/** Sign in to the 128bit family account: the same one as 128bitPlay, 128bitfit and Tracker. */
export function FamilyAccount() {
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ text: string; bad?: boolean } | null>(null);

  useEffect(() => {
    const load = () => void familyEmail().then(setEmail);
    load();
    return onFamily(load);
  }, []);

  async function run(fn: () => Promise<string | void>) {
    setBusy(true);
    setMsg(null);
    try {
      const text = await fn();
      if (text) setMsg({ text });
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : String(e), bad: true });
    } finally {
      setBusy(false);
    }
  }

  if (email === undefined) return null;

  return (
    <View style={s.box}>
      <Text style={s.head}>128BIT FAMILY ACCOUNT</Text>
      {email ? (
        <>
          <Text style={s.body}>Signed in as {email}. Quests, bookings and check-ins show on 128bit Tracker’s timeline and feed 128bitlife.</Text>
          <View style={s.row}>
            <Pressable style={s.ghost} disabled={busy} onPress={() => run(signOutFamily)}>
              <Text style={s.ghostText}>Sign out</Text>
            </Pressable>
            <Pressable
              style={s.ghost}
              disabled={busy}
              onPress={() =>
                Alert.alert('Delete your 128bit family account?', 'Everything every 128bit app sent to it is deleted for good.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => run(async () => { await deleteFamilyAccount(); return 'Account deleted.'; }) },
                ])
              }>
              <Text style={[s.ghostText, { color: C.muted }]}>Delete account</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <>
          <Text style={s.body}>One sign-in for every 128bit app. Signed in, your trip XP reaches 128bitlife and your timeline.</Text>
          <Pressable style={s.btn} disabled={busy} onPress={() => run(() => signInWith('google'))}>
            <Text style={s.btnText}>Continue with Google</Text>
          </Pressable>
          <Pressable style={[s.btn, s.btnAlt]} disabled={busy} onPress={() => run(() => signInWith('apple'))}>
            <Text style={[s.btnText, { color: C.ink }]}>Continue with Apple</Text>
          </Pressable>
          <TextInput style={s.input} placeholder="Email" placeholderTextColor={C.muted} value={mail} onChangeText={setMail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={s.input} placeholder="Password" placeholderTextColor={C.muted} value={pass} onChangeText={setPass} secureTextEntry />
          <View style={s.row}>
            <Pressable style={s.ghost} disabled={busy || !mail || !pass} onPress={() => run(async () => { await signInEmail(mail, pass); setPass(''); })}>
              <Text style={s.ghostText}>Sign in</Text>
            </Pressable>
            <Pressable
              style={s.ghost}
              disabled={busy || !mail || pass.length < 6}
              onPress={() => run(async () => ((await signUpEmail(mail, pass)) ? undefined : 'Check your email for the confirmation link, then sign in.'))}>
              <Text style={s.ghostText}>Create account</Text>
            </Pressable>
          </View>
        </>
      )}
      {msg ? <Text style={[s.body, { color: msg.bad ? C.pink : C.teal }]}>{msg.text}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  box: { margin: 16, marginBottom: 0, padding: 16, backgroundColor: C.panel, borderWidth: 3, borderColor: C.line, gap: 10 },
  head: { color: C.teal, fontSize: 11, letterSpacing: 2, fontWeight: '700' },
  body: { color: C.muted, fontSize: 13, lineHeight: 19 },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  btn: { backgroundColor: C.orange, padding: 12, alignItems: 'center' },
  btnAlt: { backgroundColor: 'transparent', borderWidth: 2, borderColor: C.line },
  btnText: { color: '#201100', fontWeight: '800' },
  input: { backgroundColor: C.bg, borderWidth: 2, borderColor: C.teal, color: C.ink, padding: 10, fontSize: 15 },
  ghost: { borderWidth: 2, borderColor: C.line, paddingVertical: 8, paddingHorizontal: 12 },
  ghostText: { color: C.orange, fontWeight: '700' },
});
