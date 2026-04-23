type Locale = 'cs' | 'en';

const translations: Record<string, Record<Locale, string>> = {
  'nav.today': { cs: 'Dnes', en: 'Today' },
  'nav.training': { cs: 'Trenink', en: 'Training' },
  'nav.nutrition': { cs: 'Vyziva', en: 'Nutrition' },
  'nav.habits': { cs: 'Habity', en: 'Habits' },
  'nav.progress': { cs: 'Pokrok', en: 'Progress' },
  'common.loading': { cs: 'Nacitani...', en: 'Loading...' },
  'common.error': {
    cs: 'Neco se pokazilo',
    en: 'Something went wrong',
  },
  'common.save': { cs: 'Ulozit', en: 'Save' },
  'common.cancel': { cs: 'Zrusit', en: 'Cancel' },
  'common.delete': { cs: 'Smazat', en: 'Delete' },
  'dashboard.greeting': { cs: 'Ahoj', en: 'Hello' },
  'dashboard.dailyQuests': {
    cs: 'Denni ukoly',
    en: 'Daily Quests',
  },
  'workout.complete': { cs: 'Hotovo!', en: 'Complete!' },
  'workout.rest': { cs: 'Odpocinek', en: 'Rest' },
};

let currentLocale: Locale = 'cs';

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== 'undefined') {
    localStorage.setItem('fitai_locale', locale);
  }
}

export function getLocale(): Locale {
  if (typeof window !== 'undefined') {
    return (
      (localStorage.getItem('fitai_locale') as Locale) || 'cs'
    );
  }
  return 'cs';
}

export function t(key: string): string {
  return (
    translations[key]?.[currentLocale] ||
    translations[key]?.['cs'] ||
    key
  );
}

export function initLocale() {
  currentLocale = getLocale();
}
