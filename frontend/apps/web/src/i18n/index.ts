import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import amAuth from '@nafi/i18n/locales/am/auth.json';
import amCommon from '@nafi/i18n/locales/am/common.json';
import amLanding from '@nafi/i18n/locales/am/landing.json';
import amNav from '@nafi/i18n/locales/am/nav.json';
import enAuth from '@nafi/i18n/locales/en/auth.json';
import enCommon from '@nafi/i18n/locales/en/common.json';
import enLanding from '@nafi/i18n/locales/en/landing.json';
import enNav from '@nafi/i18n/locales/en/nav.json';
import omAuth from '@nafi/i18n/locales/om/auth.json';
import omCommon from '@nafi/i18n/locales/om/common.json';
import omLanding from '@nafi/i18n/locales/om/landing.json';
import omNav from '@nafi/i18n/locales/om/nav.json';
import tiAuth from '@nafi/i18n/locales/ti/auth.json';
import tiCommon from '@nafi/i18n/locales/ti/common.json';
import tiLanding from '@nafi/i18n/locales/ti/landing.json';
import tiNav from '@nafi/i18n/locales/ti/nav.json';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@nafi/i18n';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: enCommon, auth: enAuth, nav: enNav, landing: enLanding },
      am: { common: amCommon, auth: amAuth, nav: amNav, landing: amLanding },
      om: { common: omCommon, auth: omAuth, nav: omNav, landing: omLanding },
      ti: { common: tiCommon, auth: tiAuth, nav: tiNav, landing: tiLanding },
    },
    fallbackLng: DEFAULT_LOCALE,
    supportedLngs: SUPPORTED_LOCALES as unknown as string[],
    defaultNS: 'common',
    ns: ['common', 'auth', 'nav', 'landing'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'nafi.locale',
      caches: ['localStorage'],
    },
  });

export default i18n;
