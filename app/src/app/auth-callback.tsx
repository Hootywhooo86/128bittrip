import { router } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';

/**
 * bit128trip://auth-callback: Google / Apple sign-in coming back. The in-app browser
 * session in src/family.ts already has the code; this route only keeps the router from
 * showing "not found" when Android also delivers the link here.
 */
export default function AuthCallback() {
  useEffect(() => {
    router.replace('/passport');
  }, []);
  return <View style={{ flex: 1, backgroundColor: '#0b0b16' }} />;
}
