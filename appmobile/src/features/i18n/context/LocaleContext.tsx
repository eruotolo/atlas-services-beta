import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { translate, setLocale as setI18nLocale, getLocale } from '@/features/i18n/lib/i18n';
import { setClientLocale } from '@/shared/lib/apiClient';

type Locale = 'es' | 'en';
const STORAGE_KEY = 'hireeo.locale';

interface LocaleContextValue {
  readonly locale: Locale;
  readonly setLocale: (locale: Locale) => Promise<void>;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  children,
}: {
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  useEffect(() => {
    setClientLocale(locale);
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'es' || stored === 'en') {
          setI18nLocale(stored);
          setLocaleState(stored);
          setClientLocale(stored);
        }
      })
      .catch(() => { /* ignore */ });
  }, [locale]);

  const setLocale = useCallback(async (next: Locale): Promise<void> => {
    try {
      setI18nLocale(next);
      setLocaleState(next);
      setClientLocale(next);
      await SecureStore.setItemAsync(STORAGE_KEY, next);
    } catch (e) {
      console.warn('Failed to save locale', e);
    }
  }, []);

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (ctx == null) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT(): (scope: string, options?: Record<string, unknown>) => string {
  const { locale } = useLocale();
  return useCallback(
    // `locale` is used directly in the function body so the React Compiler
    // treats it as a real dependency and invalidates the cached result when
    // the language changes.
    (scope: string, options?: Record<string, unknown>) => translate(locale, scope, options),
    [locale],
  );
}
