import { createI18n } from 'vue-i18n';
import zh_CN from './zh-CN.json';
import en_US from './en-US.json';

const messages = {
  'zh-CN': zh_CN,
  'en-US': en_US,
};

const getLocale = () => {
  const savedLocale = localStorage.getItem('locale');
  if (savedLocale && messages[savedLocale as keyof typeof messages]) {
    return savedLocale;
  }

  const browserLocale = navigator.language;
  if (messages[browserLocale as keyof typeof messages]) {
    return browserLocale;
  }

  // Handle cases like 'zh-TW' or 'en-GB' by checking the prefix
  if (browserLocale) {
    const shortLocale = browserLocale.split('-')[0];
    if (shortLocale) {
      const matchedLocale = Object.keys(messages).find(key => key.startsWith(shortLocale));
      if (matchedLocale) return matchedLocale;
    }
  }

  return 'zh-CN';
};

const i18n = createI18n({
  legacy: false,
  locale: getLocale(),
  fallbackLocale: 'zh-CN',
  messages,
});

export default i18n;