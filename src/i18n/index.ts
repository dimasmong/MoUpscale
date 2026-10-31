import { Language, TranslationDictionary } from '../types/i18n';
import { en } from './en';
import { id } from './id';

export const translations: Record<Language, TranslationDictionary> = {
  en,
  id,
};

const LANGUAGE_KEY = 'moupscale_language';

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    if (saved === 'en' || saved === 'id') {
      return saved;
    }
    const navLang = navigator.language.toLowerCase();
    if (navLang.startsWith('id')) {
      return 'id';
    }
  } catch {
    // ignore
  }
  return 'en';
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}
