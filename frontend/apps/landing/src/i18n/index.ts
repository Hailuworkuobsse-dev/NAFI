import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import amAuth from '@nafi/i18n/locales/am/auth.json';
import amCommon from '@nafi/i18n/locales/am/common.json';
import amNav from '@nafi/i18n/locales/am/nav.json';
import enAuth from '@nafi/i18n/locales/en/auth.json';
import enCommon from '@nafi/i18n/locales/en/common.json';
import enNav from '@nafi/i18n/locales/en/nav.json';
import omAuth from '@nafi/i18n/locales/om/auth.json';
import omCommon from '@nafi/i18n/locales/om/common.json';
import omNav from '@nafi/i18n/locales/om/nav.json';
import tiAuth from '@nafi/i18n/locales/ti/auth.json';
import tiCommon from '@nafi/i18n/locales/ti/common.json';
import tiNav from '@nafi/i18n/locales/ti/nav.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@nafi/i18n';

import amLanding from './locales/am/landing.json';
import enLanding from './locales/en/landing.json';
import omLanding from './locales/om/landing.json';
import tiLanding from './locales/ti/landing.json';

const resources = {
  en: { common: enCommon, auth: enAuth, nav: enNav, landing: enLanding },
  am: { common: amCommon, auth: amAuth, nav: amNav, landing: amLanding },
  om: { common: omCommon, auth: omAuth, nav: omNav, landing: omLanding },
  ti: { common: tiCommon, auth: tiAuth, nav: tiNav, landing: tiLanding },
};

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: 'common',
    ns: ['common', 'auth', 'nav', 'landing'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'nafi.locale',
      caches: ['localStorage'],
    },
  });

document.documentElement.setAttribute('data-i18n-ready', 'true');

export default i18n;
