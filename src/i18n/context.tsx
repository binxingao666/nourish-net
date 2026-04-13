import { createContext, useContext, useState, type ReactNode } from 'react';
import en, { type Translations } from './en';
import es from './es';
import de from './de';
import zh from './zh';

export type Locale = 'en' | 'es' | 'de' | 'zh';

const translations: Record<Locale, Translations> = { en, es, de, zh };

export const localeLabels: Record<Locale, string> = {
  en: 'EN',
  es: 'ES',
  de: 'DE',
  zh: '中文',
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  const t = translations[locale];
  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
