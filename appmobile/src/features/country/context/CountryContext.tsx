import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as Localization from 'expo-localization';
import {
  COUNTRY_CONFIG,
  COUNTRY_CODES,
  detectCountryFromRegion,
  type CountryCode,
  type CountryConfig,
} from '@/features/country/lib/countryConfig';
import { setClientCountryCode } from '@/shared/lib/apiClient';

const STORAGE_KEY = 'hireeo.country';

interface CountryContextValue {
  readonly country: CountryConfig;
  readonly countryCode: CountryCode;
  readonly setCountry: (code: CountryCode) => Promise<void>;
}

const CountryContext = createContext<CountryContextValue | null>(null);

function resolveInitialCountry(): CountryCode {
  const locales = Localization.getLocales();

  // Scan all configured locales; prefer any LATAM/Spain country over US.
  // A device set to en-US does NOT mean the user is physically in the US —
  // many LATAM users keep their phones in English. Without GPS/IP we can't
  // distinguish them, so we never auto-assign 'us'.
  for (const locale of locales) {
    const code = detectCountryFromRegion(locale.regionCode);
    if (code !== 'us') return code; // found a clear LATAM/Spain country
  }

  // Only commit to 'us' if the device has BOTH English language AND US region,
  // with no LATAM signal anywhere in the locale list.
  const primary = locales[0];
  if (
    primary?.languageCode === 'en' &&
    primary?.regionCode?.toUpperCase() === 'US' &&
    locales.length === 1
  ) {
    return 'us';
  }

  // Default: primary market
  return 'cl';
}

export function CountryProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [countryCode, setCountryCodeState] = useState<CountryCode>(resolveInitialCountry());

  useEffect(() => {
    setClientCountryCode(countryCode);
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (stored != null && COUNTRY_CODES.includes(stored as CountryCode)) {
          setCountryCodeState(stored as CountryCode);
          setClientCountryCode(stored as CountryCode);
        }
      })
      .catch(() => { /* ignore */ });
  }, [countryCode]);

  const setCountry = useCallback(async (code: CountryCode): Promise<void> => {
    setCountryCodeState(code);
    setClientCountryCode(code);
    await SecureStore.setItemAsync(STORAGE_KEY, code);
  }, []);

  return (
    <CountryContext.Provider
      value={{ country: COUNTRY_CONFIG[countryCode], countryCode, setCountry }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export function useCountry(): CountryContextValue {
  const ctx = useContext(CountryContext);
  if (ctx == null) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
}
