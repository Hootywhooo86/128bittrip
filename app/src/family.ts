/**
 * The 128bit family account and feed.
 *
 * One sign-in across 128bitPlay, 128bitfit, 128bit Tracker and the rest (Google, Apple
 * or email), and every event this app emits (src/events.ts) goes to the family feed so
 * Tracker's timeline and 128bitlife see it. Schema: 128bittracker's docs/EVENTS.md.
 *
 * Offline-first: events wait in an outbox and go up a few seconds later. Nothing is
 * collected while signed out.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

/** The 128bit family project. Its publishable key is meant to ship inside apps. */
export const FAMILY_PROJECT = {
  url: 'https://wvflpwtaszpstmjpkrhu.supabase.co',
  key: 'sb_publishable_dO8uP74cTV1tbuqESgxysw_323C7lWh',
};

const SESSION_KEY = 'bit128trip_family_session';
const OUTBOX_KEY = '128bit.family.outbox';
const OUTBOX_MAX = 500;
const AUTH_CALLBACK = 'bit128trip://auth-callback';

type Session = { access: string; refresh: string; expires: number; email: string };
export type FamilyEvent = { id: string; app: 'trip'; type: string; at: number; data: Record<string, unknown> };

// --- Session (Keychain / Keystore on phones; browser storage on web) ------------------

async function readSession(): Promise<Session | null> {
  try {
    const raw = Platform.OS === 'web' ? await AsyncStorage.getItem(SESSION_KEY) : await SecureStore.getItemAsync(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

async function writeSession(s: Session | null) {
  const raw = s ? JSON.stringify(s) : null;
  if (Platform.OS === 'web') {
    if (raw) await AsyncStorage.setItem(SESSION_KEY, raw);
    else await AsyncStorage.removeItem(SESSION_KEY);
  } else if (raw) {
    await SecureStore.setItemAsync(SESSION_KEY, raw);
  } else {
    await SecureStore.deleteItemAsync(SESSION_KEY);
  }
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();
/** Signed in or out. */
export function onFamily(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export async function familyEmail(): Promise<string | null> {
  return (await readSession())?.email ?? null;
}

// --- Supabase ---------------------------------------------------------------------------

async function call(path: string, body: unknown, token?: string): Promise<Record<string, unknown> | null> {
  let res: Response;
  try {
    res = await fetch(FAMILY_PROJECT.url + path, {
      method: 'POST',
      headers: {
        apikey: FAMILY_PROJECT.key,
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error('Couldn’t reach the 128bit family account. Check the connection.');
  }
  const text = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // not JSON
  }
  if (!res.ok) {
    throw new Error(String(json?.error_description ?? json?.msg ?? json?.message ?? `The account service answered ${res.status}`));
  }
  return json;
}

function toSession(a: Record<string, unknown> | null, email = ''): Session {
  const user = a?.user as { email?: string } | undefined;
  if (!a?.access_token || !a.refresh_token) throw new Error('Sign-in failed.');
  return {
    access: String(a.access_token),
    refresh: String(a.refresh_token),
    expires: Number(a.expires_at ?? Math.floor(Date.now() / 1000) + Number(a.expires_in ?? 3600)),
    email: user?.email ?? email,
  };
}

async function token(): Promise<string | null> {
  const s = await readSession();
  if (!s) return null;
  if (s.expires - 60 > Date.now() / 1000) return s.access;
  try {
    const fresh = toSession(await call('/auth/v1/token?grant_type=refresh_token', { refresh_token: s.refresh }), s.email);
    await writeSession(fresh);
    return fresh.access;
  } catch (e) {
    if (e instanceof Error && /invalid|not found|revoked|expired/i.test(e.message)) await writeSession(null);
    throw e;
  }
}

// --- Signing in -------------------------------------------------------------------------

export async function signInEmail(email: string, password: string) {
  await writeSession(toSession(await call('/auth/v1/token?grant_type=password', { email: email.trim(), password }), email.trim()));
  void flushFamily();
}

/** False when the email has to be confirmed first. */
export async function signUpEmail(email: string, password: string): Promise<boolean> {
  const a = await call('/auth/v1/signup', { email: email.trim(), password });
  if (!a?.access_token) return false;
  await writeSession(toSession(a, email.trim()));
  return true;
}

/**
 * Google / Apple through Supabase's sign-in page in an in-app browser, back through
 * bit128trip://auth-callback. PKCE (S256): a code caught by another app is useless
 * without the verifier that never leaves this one.
 */
export async function signInWith(provider: 'google' | 'apple') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const verifier = Array.from(Crypto.getRandomBytes(64), (b) => chars[b % chars.length]).join('');
  const challenge = (
    await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, verifier, { encoding: Crypto.CryptoEncoding.BASE64 })
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  const result = await WebBrowser.openAuthSessionAsync(
    `${FAMILY_PROJECT.url}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(AUTH_CALLBACK)}` +
      `&code_challenge=${challenge}&code_challenge_method=s256`,
    AUTH_CALLBACK,
  );
  if (result.type !== 'success') throw new Error('Sign-in was cancelled.');
  const back = new URL(result.url);
  const code = back.searchParams.get('code');
  if (!code) throw new Error(back.searchParams.get('error_description') ?? 'Sign-in was refused.');
  await writeSession(toSession(await call('/auth/v1/token?grant_type=pkce', { auth_code: code, code_verifier: verifier })));
  void flushFamily();
}

/** Signs out and drops anything not yet sent. */
export async function signOutFamily() {
  await AsyncStorage.removeItem(OUTBOX_KEY);
  await writeSession(null);
}

/** Deletes the 128bit family account and everything every 128bit app stored in it. */
export async function deleteFamilyAccount() {
  const t = await token();
  if (!t) throw new Error('Sign in first.');
  await call('/rest/v1/rpc/delete_my_account', {}, t);
  await signOutFamily();
}

// --- Outbox -----------------------------------------------------------------------------

let timer: ReturnType<typeof setTimeout> | null = null;
let sending: Promise<void> | null = null;

async function outbox(): Promise<FamilyEvent[]> {
  try {
    return JSON.parse((await AsyncStorage.getItem(OUTBOX_KEY)) ?? '[]') as FamilyEvent[];
  } catch {
    return [];
  }
}

/** Queues one event for the family feed. Does nothing while signed out. Never throws. */
export function queueFamilyEvent(type: string, data: Record<string, unknown>, at = Date.now()) {
  void (async () => {
    if (!(await readSession())) return;
    const q = await outbox();
    q.push({ id: `trip-${at.toString(36)}-${Math.random().toString(36).slice(2, 10)}`, app: 'trip', type, at, data });
    await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(q.slice(-OUTBOX_MAX)));
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      void flushFamily();
    }, 3000);
  })().catch(() => {});
}

/** Sends what's waiting; keeps it for later when offline. */
export function flushFamily(): Promise<void> {
  sending ??= (async () => {
    const q = await outbox();
    if (!q.length) return;
    const t = await token();
    if (!t) return;
    const batch = q.slice(0, 100);
    await call('/rest/v1/rpc/log_events', { events: batch }, t);
    const sent = new Set(batch.map((e) => e.id));
    const rest = (await outbox()).filter((e) => !sent.has(e.id));
    await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(rest));
    if (rest.length) setTimeout(() => void flushFamily(), 0);
  })()
    .catch(() => {})
    .finally(() => {
      sending = null;
    });
  return sending;
}
