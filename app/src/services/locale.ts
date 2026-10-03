import { getLocales } from 'expo-localization';

import { CURRENCIES, Currency } from './prices';

/** Currency for the device's region (e.g. CAD in Canada), or USD if we don't support it. */
export function localCurrency(): Currency {
  try {
    const code = getLocales()[0]?.currencyCode?.toUpperCase();
    return CURRENCIES.find((c) => c === code) ?? 'USD';
  } catch {
    return 'USD';
  }
}
