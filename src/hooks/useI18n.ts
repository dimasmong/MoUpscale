import { useState, useCallback } from 'react';
import { Language, TranslationDictionary } from '../types/i18n';
import { getInitialLanguage, saveLanguage, translations, interpolate } from '../i18n';

export function useI18n() {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    saveLanguage(lang);
  }, []);

  const t: TranslationDictionary = translations[language];

  const format = useCallback(
    (template: string, params: Record<string, string | number>) => {
      return interpolate(template, params);
    },
    []
  );

  return { language, setLanguage, t, format };
}
