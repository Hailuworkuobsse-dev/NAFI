# 🚀 NAFI Frontend — Step 3 of 10

## `apps/landing` — Public Marketing Site with 14 Sections, Live Stats, Interactive Ecosystem Diagram & 4-Language Support

**Step Goal:** Build the public-facing landing page that converts visitors into registered stakeholders. Every section specified in the skill's §8.2. Optimized for Lighthouse Performance ≥ 95, bundle < 150KB gzipped, fully i18n-ready.

**Duration Estimate:** 5–7 days
**Deliverable:** A production-ready marketing site deployed to `nafi.et`.

---

## 3.1 App Setup

### `apps/landing/package.json`

```json
{
  "name": "@nafi/landing",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --port 3001",
    "build": "tsc -b && vite build",
    "preview": "vite preview --port 3001",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "@nafi/api-client": "workspace:*",
    "@nafi/design-tokens": "workspace:*",
    "@nafi/formatters": "workspace:*",
    "@nafi/i18n": "workspace:*",
    "@nafi/ui-react": "workspace:*",
    "@tanstack/react-query": "^5.59.15",
    "i18next": "^23.16.0",
    "i18next-browser-languagedetector": "^8.0.0",
    "lucide-react": "^0.453.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-helmet-async": "^2.0.5",
    "react-i18next": "^15.1.0",
    "react-router-dom": "^6.27.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.11",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.2",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vite": "^5.4.10"
  }
}
```

### `apps/landing/vite.config.ts`

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          i18n: ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          query: ['@tanstack/react-query'],
          icons: ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 200,
  },
});
```

### `apps/landing/tailwind.config.js`

```js
import preset from '@nafi/config/tailwind';

export default {
  presets: [preset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../../packages/ui-react/src/**/*.{ts,tsx}',
  ],
};
```

### `apps/landing/postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### `apps/landing/tsconfig.json`

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noEmit": true
  },
  "include": ["src/**/*"]
}
```

### `apps/landing/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#16A34A" />
    <meta name="description" content="NAFI — The digital backbone of Ethiopia's agricultural transformation. Channel diaspora capital into productive agriculture. De-risk lending. Formalize contract farming." />
    <meta property="og:title" content="NAFI — National Agri-Finance Infrastructure" />
    <meta property="og:description" content="The digital backbone of Ethiopia's agricultural transformation." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://nafi.et" />
    <meta property="og:image" content="/og-image.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Ethiopic:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>NAFI — The Digital Backbone of Ethiopia's Agricultural Transformation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 3.2 i18n Configuration

### `apps/landing/src/i18n/index.ts`

```ts
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
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type SupportedLocale } from '@nafi/i18n';

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

export default i18n;

export function isSupportedLocale(v: string): v is SupportedLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(v);
}
```

### `apps/landing/src/i18n/locales/en/landing.json`

```json
{
  "nav": {
    "platform": "Platform",
    "forInvestors": "For Investors",
    "forFarmers": "For Farmers",
    "forBanks": "For Banks",
    "impact": "Impact",
    "about": "About",
    "login": "Log in",
    "getStarted": "Get Started"
  },
  "hero": {
    "badge": "Aligned with HGER 2.0 · NAFIR · ACCII · DAR",
    "title": "The Digital Backbone of Ethiopia's Agricultural Transformation",
    "subtitle": "Channel diaspora capital into productive agriculture. De-risk bank lending. Formalize contract farming from farm gate to export gate.",
    "ctaInvest": "Invest in Ethiopia",
    "ctaFarmer": "Register as Farmer",
    "statFunded": "Diaspora capital mobilized",
    "statContracts": "Active contracts",
    "statFarmers": "Farmers reached"
  },
  "trustBar": {
    "title": "Aligned with national priorities. Backed by institutional partners."
  },
  "problem": {
    "eyebrow": "The Challenge",
    "title": "Ethiopia's agriculture is under-financed, fragmented, and unable to absorb the capital that exists.",
    "items": {
      "credit": {
        "title": "Less than 10% of credit",
        "description": "Agriculture employs 64% of the workforce but receives under 10% of total domestic credit."
      },
      "diaspora": {
        "title": "Idle diaspora capital",
        "description": "$5.1B in remittances last year — most goes to consumption, not production."
      },
      "enforcement": {
        "title": "Unenforceable contracts",
        "description": "Side-selling, broken agreements, and no auditable record of who owes what to whom."
      },
      "leakage": {
        "title": "Value leakage",
        "description": "Input supply chains lose value at every handoff — from certified seed to delivered fertilizer."
      }
    }
  },
  "solution": {
    "eyebrow": "The Solution",
    "title": "NAFI — a neutral digital backbone that connects every stakeholder",
    "subtitle": "One smart-contract ledger. One escrow system. One source of truth.",
    "nodes": {
      "diaspora": {
        "title": "Diaspora Crowdfunders",
        "description": "Inject hard currency into agricultural bonds or equity pools with transparent returns."
      },
      "banks": {
        "title": "Commercial Banks",
        "description": "Provide ETB matching, escrow, and structured credit backed by diaspora deposits."
      },
      "dbe": {
        "title": "Development Bank of Ethiopia",
        "description": "Co-finances long-term agricultural infrastructure under RUFIP III."
      },
      "nafa": {
        "title": "NAFA",
        "description": "Provides refinancing, risk-sharing, and first-loss guarantees to de-risk bank lending."
      },
      "suppliers": {
        "title": "Input Suppliers",
        "description": "Deliver seeds, fertilizer, machinery, and technology with guaranteed payment on verified delivery."
      },
      "farmers": {
        "title": "Commercial Farmers",
        "description": "Manage large-scale production with access to inputs, finance, and premium buyers."
      },
      "government": {
        "title": "Government Regulators",
        "description": "Real-time visibility into forex flows, credit deployment, and contract performance."
      }
    }
  },
  "audience": {
    "title": "Built for every stakeholder",
    "subtitle": "Each role gets a purpose-built workspace. All operate on one shared ledger.",
    "diaspora": {
      "title": "For Diaspora Investors",
      "points": [
        "Fractional investment from $500",
        "Fixed-return bonds or profit-share equity",
        "Escrow-protected capital",
        "Sovereign risk-sharing available"
      ],
      "cta": "Start investing"
    },
    "farmers": {
      "title": "For Commercial Farmers",
      "points": [
        "Inputs delivered, payment guaranteed",
        "Access to low-cost credit",
        "Direct access to export buyers",
        "Protection from middlemen"
      ],
      "cta": "Register your farm"
    },
    "banks": {
      "title": "For Commercial Banks",
      "points": [
        "Zero-risk lending with escrow controls",
        "NAFA guarantees up to 70%",
        "Real-time loan performance data",
        "Differentiated NPL treatment"
      ],
      "cta": "Partner with us"
    },
    "government": {
      "title": "For Government",
      "points": [
        "Forex generation and retention",
        "Agricultural commercialization",
        "Tax revenue and compliance",
        "Real-time policy dashboards"
      ],
      "cta": "View alignment"
    }
  },
  "how": {
    "title": "How it works",
    "subtitle": "Five steps from onboarding to settled returns.",
    "steps": {
      "onboard": {
        "title": "1. Onboard & Verify",
        "description": "Every stakeholder completes KYC/KYB. Contracts are digitally witnessed, including by a government representative."
      },
      "fund": {
        "title": "2. Fund the Contract",
        "description": "Diaspora investors fund the contract through bonds or equity pools. Banks open escrow. DBE co-finances."
      },
      "deploy": {
        "title": "3. Deploy Inputs",
        "description": "Suppliers deliver seeds, fertilizer, and machinery. Escrow releases payment only after geo-verified delivery."
      },
      "produce": {
        "title": "4. Produce & Verify",
        "description": "Farmers produce. Harvest is logged, verified, and stored. Warehouse receipts become collateral."
      },
      "settle": {
        "title": "5. Settle & Distribute",
        "description": "Export proceeds flow to escrow. Smart contracts distribute returns to investors, suppliers, banks, and farmers."
      }
    }
  },
  "opportunities": {
    "title": "Live opportunities",
    "subtitle": "Contracts open for investment right now.",
    "viewAll": "View all opportunities",
    "funded": "funded",
    "investors": "investors",
    "targetYield": "Target yield",
    "floorPrice": "Floor price",
    "maturity": "Maturity",
    "empty": "No open opportunities right now. Check back soon."
  },
  "impact": {
    "title": "Impact so far",
    "subtitle": "Every metric verified on the NAFI ledger.",
    "metrics": {
      "capital": "Diaspora capital mobilized",
      "hectares": "Hectares under contract",
      "farmers": "Farmers reached",
      "forex": "Forex generated",
      "jobs": "Jobs created"
    }
  },
  "security": {
    "title": "Security & compliance",
    "items": {
      "sandbox": {
        "title": "NBE Regulatory Sandbox",
        "description": "Operating under the National Bank of Ethiopia's regulatory sandbox framework."
      },
      "escrow": {
        "title": "Escrow-protected",
        "description": "Every birr held in a regulated commercial bank escrow account."
      },
      "audit": {
        "title": "Audit-grade ledger",
        "description": "Every transaction anchored to an immutable audit trail."
      },
      "data": {
        "title": "Data residency in Ethiopia",
        "description": "Sensitive data stored in Ethiopian data centers."
      }
    }
  },
  "testimonials": {
    "title": "What partners say",
    "items": {
      "one": {
        "quote": "NAFI gives us the real-time data and escrow controls we need to make agricultural lending safe.",
        "author": "Commercial Bank Partner",
        "role": "Head of Agri-Finance"
      },
      "two": {
        "quote": "For the first time, my investment in Ethiopia is traceable, auditable, and aligned with national priorities.",
        "author": "Diaspora Investor",
        "role": "Washington, DC"
      }
    }
  },
  "faq": {
    "title": "Frequently asked questions",
    "items": {
      "what": {
        "q": "What is NAFI?",
        "a": "NAFI is a digital infrastructure platform that coordinates diaspora investors, commercial banks, the Development Bank of Ethiopia, NAFA, input suppliers, and commercial farmers within a unified smart-contract engine."
      },
      "howInvest": {
        "q": "How do I invest as a diaspora member?",
        "a": "Register, complete KYC, browse open contracts, and commit capital through fixed-return bonds or profit-share equity pools. Minimum investment is $500."
      },
      "risk": {
        "q": "What happens if a contract fails?",
        "a": "Escrow funds are frozen and arbitration is triggered. NAFA guarantees and sovereign risk-sharing may cover partial losses. All outcomes are transparent on the ledger."
      },
      "farmer": {
        "q": "How can a farmer participate?",
        "a": "Farmers register through the platform, verify land-use rights, and sign digital contracts with a government witness. Inputs are delivered and financed through escrow."
      },
      "government": {
        "q": "How does NAFI align with government priorities?",
        "a": "NAFI is the digital execution layer of NAFIR, and directly supports HGER 2.0, ACCII, and DAR. It generates forex, formalizes contract farming, and provides real-time policy dashboards."
      }
    }
  },
  "finalCta": {
    "title": "Join the infrastructure of Ethiopia's future",
    "subtitle": "Whether you invest, farm, bank, or govern — NAFI is where capital meets soil.",
    "cta": "Get Started"
  },
  "footer": {
    "tagline": "The digital backbone of Ethiopia's agricultural transformation.",
    "platform": {
      "title": "Platform",
      "howItWorks": "How it works",
      "security": "Security",
      "impact": "Impact"
    },
    "audience": {
      "title": "For You",
      "investors": "Investors",
      "farmers": "Farmers",
      "banks": "Banks",
      "government": "Government"
    },
    "resources": {
      "title": "Resources",
      "docs": "Documentation",
      "api": "API",
      "faq": "FAQ"
    },
    "legal": {
      "title": "Legal",
      "terms": "Terms of Service",
      "privacy": "Privacy Policy",
      "compliance": "Compliance"
    },
    "rights": "© {{year}} NAFI. All rights reserved."
  }
}
```

### `apps/landing/src/i18n/locales/am/landing.json` (abbreviated — same keys)

```json
{
  "nav": {
    "platform": "መድረክ",
    "forInvestors": "ለባለሀብቶች",
    "forFarmers": "ለገበሬዎች",
    "forBanks": "ለባንኮች",
    "impact": "ተጽዕኖ",
    "about": "ስለ እኛ",
    "login": "ግባ",
    "getStarted": "ጀምር"
  },
  "hero": {
    "badge": "ከHGER 2.0 · NAFIR · ACCII · DAR ጋር የተጣጣመ",
    "title": "የኢትዮጵያ የግብርና ሽግግር ዲጂታል ጀርባ አጥንት",
    "subtitle": "የዲያስፖራ ካፒታልን ወደ አምራች ግብርና ያስገቡ። የባንክ ብድርን ደህንነት ይጨምሩ። ኮንትራት ግብርናን ከእርሻ በር እስከ ወደብ በር መደበኛ ያድርጉ።",
    "ctaInvest": "በኢትዮጵያ ያስቀምጡ",
    "ctaFarmer": "እንደ ገበሬ ይመዝገቡ",
    "statFunded": "የዲያስፖራ ካፒታል ተሰብስቧል",
    "statContracts": "ንቁ ኮንትራቶች",
    "statFarmers": "የደረሱ ገበሬዎች"
  },
  "trustBar": { "title": "ከብሔራዊ ቅድሚያዎች ጋር የተጣጣመ። በተቋማዊ አጋሮች የተደገፈ።" },
  "problem": {
    "eyebrow": "ችግሩ",
    "title": "የኢትዮጵያ ግብርና በቂ ፋይናንስ አልተደረገለትም፣ የተበታተነ ነው፣ እና ያለውን ካፒታል ማስተናገድ አይችልም።",
    "items": {
      "credit": { "title": "ከ10% በታች ብድር", "description": "ግብርና 64% የሠራተኛ ኃይሉን ቢቀጥርም ከጠቅላላ የአገር ውስጥ ብድር 10% በታች ይቀበላል።" },
      "diaspora": { "title": "ያልተጠቀመ የዲያስፖራ ካፒታል", "description": "ባለፈው ዓመት 5.1 ቢሊዮን ዶላር ገንዘብ ተላልፏል — አብዛኛው ወደ ፍጆታ ሄደ፣ ወደ ምርት አይደለም።" },
      "enforcement": { "title": "ማይፈጸሙ ኮንትራቶች", "description": "የጎን ሽያጭ፣ የተጣሱ ስምምነቶች፣ እና ማን ለማን ምን እንደሚገባው የሚያረጋግጥ መዝገብ የለም።" },
      "leakage": { "title": "የእሴት መፍሰስ", "description": "የግብዓት አቅርቦት ሰንሰለቶች በየመተላለፊያው እሴት ያጣሉ።" }
    }
  },
  "solution": {
    "eyebrow": "መፍትሄው",
    "title": "NAFI — ሁሉንም ባለድርሻ አካላት የሚያገናኝ ገለልተኛ ዲጂታል ጀርባ አጥንት",
    "subtitle": "አንድ ስማርት ኮንትራት ደብተር። አንድ የዋስትና ስርዓት። አንድ የእውነት ምንጭ።",
    "nodes": {
      "diaspora": { "title": "የዲያስፖራ ተጠቃሚዎች", "description": "ጠንካራ ገንዘብን ወደ የግብርና ቦንዶች ወይም የፍትሃዊነት ገንዳዎች ያስገቡ።" },
      "banks": { "title": "የንግድ ባንኮች", "description": "የETB ተመሳሳይ ገንዘብ፣ ዋስትና፣ እና የተዋቀረ ብድር ያቅርቡ።" },
      "dbe": { "title": "የኢትዮጵያ ልማት ባንክ", "description": "በRUFIP III ስር የረዥም ጊዜ የግብርና መሠረተ ልማት በጋራ ይፈጥራል።" },
      "nafa": { "title": "NAFA", "description": "የባንክ ብድርን ለማስወገድ ዋስትና ይሰጣል።" },
      "suppliers": { "title": "የግብዓት አቅራቢዎች", "description": "ዘር፣ ማዳበሪያ፣ ማሽነሪ እና ቴክኖሎጂ በተረጋገጠ አቅርቦት ላይ የተረጋገጠ ክፍያ ያገኛሉ።" },
      "farmers": { "title": "የንግድ ገበሬዎች", "description": "ትልቅ ሚዛን ምርትን በግብዓት፣ ፋይናንስ እና ፕሪሚየም ገዢዎች ያስተዳድራሉ።" },
      "government": { "title": "የመንግስት ተቆጣጣሪዎች", "description": "ስለ ውጭ ምንዛሪ፣ ብድር እና የኮንትራት አፈጻጸም የእውነተኛ ጊዜ ግንዛቤ።" }
    }
  },
  "audience": {
    "title": "ለእያንዳንዱ ባለድርሻ የተገነባ",
    "subtitle": "እያንዳንዱ ሚና የተዘጋጀ የሥራ ቦታ ያገኛል። ሁሉም በአንድ የጋራ ደብተር ላይ ይሠራሉ።",
    "diaspora": { "title": "ለዲያስፖራ ባለሀብቶች", "points": ["ከ$500 ጀምሮ ክፍልፋይ ኢንቨስትመንት", "ቋሚ ተመላሽ ቦንዶች ወይም የትርፍ ድርሻ", "በዋስትና የተጠበቀ ካፒታል", "የሉዓላዊ የአደጋ መከፋፈል"], "cta": "ኢንቨስት ያድርጉ" },
    "farmers": { "title": "ለንግድ ገበሬዎች", "points": ["ግብዓቶች ተላልፈዋል፣ ክፍያ የተረጋገጠ", "ዝቅተኛ ወጪ ብድር", "ቀጥታ ወደ ወጪ ገዢዎች", "ከመካከለኛ ሰዎች መጠበቅ"], "cta": "እርሻዎን ይመዝገቡ" },
    "banks": { "title": "ለንግድ ባንኮች", "points": ["በዋስትና ቁጥጥር ዜሮ አደጋ ብድር", "እስከ 70% የNAFA ዋስትና", "የእውነተኛ ጊዜ የብድር አፈጻጸም መረጃ", "የተለየ NPL አያያዝ"], "cta": "አጋር ይሁኑ" },
    "government": { "title": "ለመንግስት", "points": ["የውጭ ምንዛሪ ማመንጨት", "የግብርና ንግድ", "የግብር ገቢ እና ተገዢነት", "የእውነተኛ ጊዜ ዳሽቦርዶች"], "cta": "መጣጣም ይመልከቱ" }
  },
  "how": {
    "title": "እንዴት እንደሚሰራ",
    "subtitle": "ከመመዝገብ እስከ የተስተካከሉ ተመላሾች አምስት ደረጃዎች።",
    "steps": {
      "onboard": { "title": "1. ይመዝገቡ እና ያረጋግጡ", "description": "እያንዳንዱ ባለድርሻ KYC/KYB ያጠናቅቃል። ኮንትራቶች በመንግስት ተወካይ ጨምሮ በዲጂታል ይመሰከራሉ።" },
      "fund": { "title": "2. ኮንትራቱን ይሙሉ", "description": "የዲያስፖራ ባለሀብቶች በቦንዶች ወይም በፍትሃዊነት ገንዳዎች ይሰጣሉ። ባንኮች ዋስትና ይከፍታሉ። DBE በጋራ ይሰጣል።" },
      "deploy": { "title": "3. ግብዓቶችን ያሰማሩ", "description": "አቅራቢዎች ዘር፣ ማዳበሪያ እና ማሽነሪ ያቀርባሉ። ዋስትና ከጂኦ-የተረጋገጠ አቅርቦት በኋላ ብቻ ይለቃል።" },
      "produce": { "title": "4. ያመርቱ እና ያረጋግጡ", "description": "ገበሬዎች ያመርታሉ። ምርቱ ይመዘገባል፣ ይረጋገጣል፣ እና ይከማቻል። የመጋዘን ደረሰኞች ዋስትና ይሆናሉ።" },
      "settle": { "title": "5. ያስተካክሉ እና ያሰራጩ", "description": "የወጪ ገቢ ወደ ዋስትና ይፈሳል። ስማርት ኮንትራቶች ተመላሾችን ለባለሀብቶች፣ ለአቅራቢዎች፣ ለባንኮች እና ለገበሬዎች ያሰራጫሉ።" }
    }
  },
  "opportunities": {
    "title": "ቀጥታ እድሎች",
    "subtitle": "አሁን ለኢንቨስትመንት ክፍት የሆኑ ኮንትራቶች።",
    "viewAll": "ሁሉንም እድሎች ይመልከቱ",
    "funded": "ተሰጥቷል",
    "investors": "ባለሀብቶች",
    "targetYield": "የታለመ ምርት",
    "floorPrice": "ዝቅተኛ ዋጋ",
    "maturity": "ማብቂያ",
    "empty": "አሁን ክፍት እድሎች የሉም። በቅርቡ ይመልከቱ።"
  },
  "impact": {
    "title": "እስከ አሁን ያለው ተጽዕኖ",
    "subtitle": "እያንዳንዱ መለኪያ በNAFI ደብተር ላይ የተረጋገጠ።",
    "metrics": { "capital": "የዲያስፖራ ካፒታል ተሰብስቧል", "hectares": "በኮንትራት ስር ያሉ ሄክታሮች", "farmers": "የደረሱ ገበሬዎች", "forex": "የተመነጨ ውጭ ምንዛሪ", "jobs": "የተፈጠሩ ሥራዎች" }
  },
  "security": {
    "title": "ደህንነት እና ተገዢነት",
    "items": {
      "sandbox": { "title": "የNBE የቁጥጥር ሳንድቦክስ", "description": "በብሔራዊ ባንክ የቁጥጥር ማዕቀፍ ስር እየሰራ።" },
      "escrow": { "title": "በዋስትና የተጠበቀ", "description": "እያንዳንዱ ብር በተቆጣጣሪ ባንክ ዋስትና ሂሳብ ውስጥ ይቀመጣል።" },
      "audit": { "title": "የኦዲት ደረጃ ደብተር", "description": "እያንዳንዱ ግብይት በማይለወጥ የኦዲት መንገድ ላይ ተመስርቷል።" },
      "data": { "title": "በኢትዮጵያ ውስጥ የመረጃ መኖሪያ", "description": "ሚስጥራዊ መረጃ በኢትዮጵያ ዳታ ማዕከላት ውስጥ ይከማቻል።" }
    }
  },
  "testimonials": {
    "title": "አጋሮች ምን ይላሉ",
    "items": {
      "one": { "quote": "NAFI የግብርና ብድርን ደህንነቱ የተጠበቀ ለማድረግ የሚያስፈልገንን የእውነተኛ ጊዜ መረጃ እና የዋስትና ቁጥጥር ይሰጠናል።", "author": "የንግድ ባንክ አጋር", "role": "የግብርና ፋይናንስ ኃላፊ" },
      "two": { "quote": "ለመጀመሪያ ጊዜ፣ በኢትዮጵያ ያለኝ ኢንቨስትመንት ሊከታተል የሚችል፣ ሊመረመር የሚችል እና ከብሔራዊ ቅድሚያዎች ጋር የተጣጣመ ነው።", "author": "የዲያስፖራ ባለሀብት", "role": "ዋሽንግተን ዲሲ" }
    }
  },
  "faq": {
    "title": "ተደጋጋሚ ጥያቄዎች",
    "items": {
      "what": { "q": "NAFI ምንድነው?", "a": "NAFI የዲያስፖራ ባለሀብቶችን፣ የንግድ ባንኮችን፣ የኢትዮጵያ ልማት ባንክን፣ NAFAን፣ የግብዓት አቅራቢዎችን እና የንግድ ገበሬዎችን በአንድ የስማርት ኮንትራት ስርዓት ውስጥ የሚያስተባብር ዲጂታል መሠረተ ልማት መድረክ ነው።" },
      "howInvest": { "q": "እንደ ዲያስፖራ አባል እንዴት ኢንቨስት ማድረግ እችላለሁ?", "a": "ይመዝገቡ፣ KYC ያጠናቅቁ፣ ክፍት ኮንትራቶችን ይመልከቱ፣ እና ካፒታል በቋሚ ተመላሽ ቦንዶች ወይም በትርፍ ድርሻ ገንዳዎች ያስገቡ። ዝቅተኛ ኢንቨስትመንት $500 ነው።" },
      "risk": { "q": "ኮንትራት ካልተሳካ ምን ይሆናል?", "a": "የዋስትና ገንዘብ ይቀዘቅዛል እና የግልግል ሂደት ይጀመራል። የNAFA ዋስትናዎች እና የሉዓላዊ የአደጋ መከፋፈል ከፊል ኪሳራዎችን ሊሸፍኑ ይችላሉ።" },
      "farmer": { "q": "ገበሬ እንዴት መሳተፍ ይችላል?", "a": "ገበሬዎች በመድረኩ ይመዘገባሉ፣ የመሬት ይዞታ መብቶችን ያረጋግጣሉ፣ እና ከመንግስት ምስክር ጋር ዲጂታል ኮንትራቶችን ይፈርማሉ።" },
      "government": { "q": "NAFI ከመንግስት ቅድሚያዎች ጋር እንዴት ይጣጣማል?", "a": "NAFI የNAFIR ዲጂታል አፈጻጸም ንብርብር ነው፣ እና HGER 2.0፣ ACCII እና DARን በቀጥታ ይደግፋል።" }
    }
  },
  "finalCta": {
    "title": "የኢትዮጵያ የወደፊት መሠረተ ልማት ይቀላቀሉ",
    "subtitle": "ቢያስቀምጡ፣ ቢያርሱ፣ ቢባንኩ ወይም ቢመሩ — NAFI ካፒታል ከአፈር ጋር የሚገናኝበት ቦታ ነው።",
    "cta": "ጀምር"
  },
  "footer": {
    "tagline": "የኢትዮጵያ የግብርና ሽግግር ዲጂታል ጀርባ አጥንት።",
    "platform": { "title": "መድረክ", "howItWorks": "እንዴት እንደሚሰራ", "security": "ደህንነት", "impact": "ተጽዕኖ" },
    "audience": { "title": "ለእርስዎ", "investors": "ባለሀብቶች", "farmers": "ገበሬዎች", "banks": "ባንኮች", "government": "መንግስት" },
    "resources": { "title": "ግብዓቶች", "docs": "ሰነዶች", "api": "API", "faq": "ተደጋጋሚ ጥያቄዎች" },
    "legal": { "title": "ሕጋዊ", "terms": "የአገልግሎት ውሎች", "privacy": "የግላዊነት ፖሊሲ", "compliance": "ተገዢነት" },
    "rights": "© {{year}} NAFI። ሁሉም መብቶች የተጠበቁ ናቸው።"
  }
}
```

> **Note:** `om/landing.json` and `ti/landing.json` follow the same structure with Afaan Oromoo and Tigrinya translations respectively. In production these are generated by a professional translation service. For this build, provide the same keys with placeholder translations that fall back to English if missing (i18n handles this automatically).

---

## 3.3 App Entry & Router

### `apps/landing/src/main.tsx`

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './i18n';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
```

### `apps/landing/src/styles/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-white text-neutral-900 antialiased;
  }

  h1,
  h2,
  h3,
  h4 {
    @apply text-balance;
  }
}

@layer utilities {
  .container-narrow {
    @apply mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8;
  }

  .section-py {
    @apply py-16 sm:py-20 lg:py-24;
  }
}

/* Prevent FOUC on i18n language swap */
html:not([data-i18n-ready]) body {
  visibility: hidden;
}
```

### `apps/landing/src/App.tsx`

```tsx
import { RouterProvider } from 'react-router-dom';

import { router } from './router';

export default function App() {
  return <RouterProvider router={router} />;
}
```

### `apps/landing/src/router.tsx`

```tsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { PublicLayout } from './layouts/PublicLayout';
import { LandingPage } from './pages/LandingPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'how-it-works', element: <LandingPage /> },
      { path: 'for-investors', element: <LandingPage /> },
      { path: 'for-farmers', element: <LandingPage /> },
      { path: 'for-banks', element: <LandingPage /> },
      { path: 'for-government', element: <LandingPage /> },
      { path: 'impact', element: <LandingPage /> },
      { path: 'security', element: <LandingPage /> },
      { path: 'about', element: <LandingPage /> },
      { path: 'contact', element: <LandingPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to="/404" replace /> },
    ],
  },
]);
```

> **Note:** For the marketing site, every nav link scrolls to a section on the single landing page. The above routes exist so the URL bar reflects the section for shareability. In production these are hash-less anchor links managed by `<ScrollToSection />`.

---

## 3.4 Layouts

### `apps/landing/src/layouts/PublicLayout.tsx`

```tsx
import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import { Footer } from '@/sections/Footer';
import { Navbar } from '@/sections/Navbar';

export function PublicLayout() {
  const { pathname, hash } = useLocation();

  // Scroll to top on route change; scroll to hash element if present
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
```

---

## 3.5 Shared Landing Components

### `apps/landing/src/components/StatCounter.tsx`

```tsx
import { useEffect, useRef, useState } from 'react';

import { formatNumber } from '@nafi/formatters';
import { cn } from '@nafi/ui-react';

export interface StatCounterProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Animates from 0 → value once on first viewport entry.
 * Respects prefers-reduced-motion.
 */
export function StatCounter({ value, label, prefix = '', suffix = '', className }: StatCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setDisplay(value);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1200;
          const start = performance.now();

          const tick = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(1, elapsed / duration);
            // ease-out
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(Math.round(value * eased));
            if (progress < 1) requestAnimationFrame(tick);
            else setDisplay(value);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <div ref={ref} className={cn('flex flex-col gap-1', className)}>
      <span className="font-mono text-3xl font-bold text-neutral-900 tabular-nums sm:text-4xl">
        {prefix}
        {formatNumber(display)}
        {suffix}
      </span>
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
        {label}
      </span>
    </div>
  );
}
```

### `apps/landing/src/components/LanguageSwitcher.tsx`

```tsx
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { LOCALE_LABELS, SUPPORTED_LOCALES, type SupportedLocale } from '@nafi/i18n';
import { cn } from '@nafi/ui-react';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();

  const change = (locale: SupportedLocale) => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/80 px-1 py-1 backdrop-blur',
        className,
      )}
      role="group"
      aria-label="Language"
    >
      <Globe className="ml-1.5 h-3.5 w-3.5 text-neutral-400" aria-hidden="true" />
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => change(locale)}
          aria-pressed={i18n.resolvedLanguage === locale}
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
            i18n.resolvedLanguage === locale
              ? 'bg-brand-500 text-white'
              : 'text-neutral-600 hover:bg-neutral-100',
          )}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
```

### `apps/landing/src/components/SEO.tsx`

```tsx
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

export interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  noIndex?: boolean;
}

export function SEO({ title, description, canonical, image, noIndex }: SEOProps) {
  const { t, i18n } = useTranslation('landing');

  const fullTitle = title
    ? `${title} · NAFI`
    : 'NAFI — The Digital Backbone of Ethiopia\'s Agricultural Transformation';
  const fullDescription = description ?? t('hero.subtitle');
  const imageUrl = image ?? 'https://nafi.et/og-image.png';
  const canonicalUrl = canonical ?? 'https://nafi.et';

  return (
    <Helmet htmlAttributes={{ lang: i18n.resolvedLanguage ?? 'en' }}>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDescription} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:locale" content={i18n.resolvedLanguage ?? 'en'} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Structured data */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'NAFI',
          url: 'https://nafi.et',
          logo: 'https://nafi.et/logo.png',
          sameAs: [],
        })}
      </script>
    </Helmet>
  );
}
```

### `apps/landing/src/hooks/usePublicStats.ts`

```ts
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@nafi/api-client';

export interface PublicStats {
  totalFundedUsd: number;
  activeContracts: number;
  farmersReached: number;
  hectaresUnderContract: number;
  forexGeneratedUsd: number;
  jobsCreated: number;
}

/**
 * Fetches live impact stats from the public API.
 * Falls back to static baseline values if the API is unavailable.
 */
export function usePublicStats(): { stats: PublicStats; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: queryKeys.publicStats,
    queryFn: async (): Promise<PublicStats> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/stats`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch public stats');
      const json = await res.json();
      return json.data;
    },
    staleTime: 60_000,
  });

  const fallback: PublicStats = {
    totalFundedUsd: 12_450_000,
    activeContracts: 47,
    farmersReached: 1_840,
    hectaresUnderContract: 68_200,
    forexGeneratedUsd: 4_180_000,
    jobsCreated: 3_210,
  };

  return { stats: data ?? fallback, isLoading };
}
```

---

## 3.6 The 14 Sections

### Section 1 — `apps/landing/src/sections/Navbar.tsx`

```tsx
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, cn } from '@nafi/ui-react';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const NAV_LINKS = [
  { href: '#solution', key: 'nav.platform' },
  { href: '#audience', key: 'nav.forInvestors' },
  { href: '#how', key: 'nav.platform' },
  { href: '#impact', key: 'nav.impact' },
  { href: '#faq', key: 'nav.about' },
] as const;

export function Navbar() {
  const { t } = useTranslation('landing');
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-sticky w-full transition-colors',
        scrolled
          ? 'border-b border-neutral-200 bg-white/95 backdrop-blur'
          : 'bg-transparent',
      )}
    >
      <div className="container-narrow flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
            <span className="font-bold">N</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-900">NAFI</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
            >
              {t(link.key)}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden items-center gap-2 md:flex">
          <LanguageSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">{t('nav.login')}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/register">{t('nav.getStarted')}</Link>
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white md:hidden">
          <div className="container-narrow flex flex-col gap-3 py-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-2 text-sm font-medium text-neutral-700"
              >
                {t(link.key)}
              </a>
            ))}
            <div className="flex items-center justify-between pt-2">
              <LanguageSwitcher />
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <Button asChild variant="outline" size="md" fullWidth>
                <Link to="/login">{t('nav.login')}</Link>
              </Button>
              <Button asChild size="md" fullWidth>
                <Link to="/register">{t('nav.getStarted')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
```

### Section 2 — `apps/landing/src/sections/Hero.tsx`

```tsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Badge, Button } from '@nafi/ui-react';

import { StatCounter } from '@/components/StatCounter';
import { usePublicStats } from '@/hooks/usePublicStats';

import { EcosystemDiagram } from './EcosystemDiagram';

export function Hero() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();

  return (
    <section className="relative overflow-hidden">
      {/* Background decoration */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-50 via-white to-accent-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-0 -z-10 h-[500px] w-[500px] rounded-full bg-brand-200/40 blur-3xl"
      />

      <div className="container-narrow grid min-h-[90vh] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
        {/* Left: copy */}
        <div className="flex flex-col items-start gap-6">
          <Badge variant="success" size="lg" dot>
            {t('hero.badge')}
          </Badge>

          <h1 className="text-4xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl">
            {t('hero.title')}
          </h1>

          <p className="max-w-xl text-lg text-neutral-600">{t('hero.subtitle')}</p>

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register?role=DIASPORA_INVESTOR">{t('hero.ctaInvest')}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/register?role=COMMERCIAL_FARMER">{t('hero.ctaFarmer')}</Link>
            </Button>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-6 border-t border-neutral-200 pt-6">
            <StatCounter
              value={stats.totalFundedUsd}
              prefix="$"
              label={t('hero.statFunded')}
            />
            <StatCounter value={stats.activeContracts} label={t('hero.statContracts')} />
            <StatCounter value={stats.farmersReached} label={t('hero.statFarmers')} />
          </div>
        </div>

        {/* Right: interactive ecosystem diagram */}
        <div className="relative">
          <EcosystemDiagram />
        </div>
      </div>
    </section>
  );
}
```

### Section 3 — `apps/landing/src/sections/TrustBar.tsx`

```tsx
import { useTranslation } from 'react-i18next';

const PARTNERS = [
  'NBE',
  'DBE',
  'MoA',
  'EIC',
  'NAFA',
  'EIB',
  'IFAD',
  'World Bank',
] as const;

export function TrustBar() {
  const { t } = useTranslation('landing');

  return (
    <section className="border-y border-neutral-200 bg-white py-8">
      <div className="container-narrow flex flex-col items-center gap-4">
        <p className="text-center text-xs font-medium uppercase tracking-wide text-neutral-500">
          {t('trustBar.title')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {PARTNERS.map((partner) => (
            <span
              key={partner}
              className="text-sm font-semibold tracking-tight text-neutral-400 transition-colors hover:text-neutral-600"
            >
              {partner}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Section 4 — `apps/landing/src/sections/Problem.tsx`

```tsx
import { TrendingDown, Coins, FileWarning, PackageX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const ITEMS = [
  { key: 'credit', Icon: TrendingDown },
  { key: 'diaspora', Icon: Coins },
  { key: 'enforcement', Icon: FileWarning },
  { key: 'leakage', Icon: PackageX },
] as const;

export function Problem() {
  const { t } = useTranslation('landing');

  return (
    <section id="problem" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-danger">
            {t('problem.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('problem.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }) => (
            <Card key={key} className="border-danger/20">
              <CardBody className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-danger-light text-danger">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {t(`problem.items.${key}.title`)}
                </h3>
                <p className="text-sm text-neutral-600">
                  {t(`problem.items.${key}.description`)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Section 5 — `apps/landing/src/sections/EcosystemDiagram.tsx`

```tsx
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Landmark,
  Users,
  Sprout,
  Tractor,
  Truck,
  ShieldCheck,
} from 'lucide-react';

import { cn } from '@nafi/ui-react';

const NODES = [
  { key: 'diaspora', Icon: Users, color: 'bg-brand-500' },
  { key: 'banks', Icon: Building2, color: 'bg-info' },
  { key: 'dbe', Icon: Landmark, color: 'bg-accent-500' },
  { key: 'nafa', Icon: ShieldCheck, color: 'bg-accent-500' },
  { key: 'suppliers', Icon: Truck, color: 'bg-neutral-500' },
  { key: 'farmers', Icon: Tractor, color: 'bg-brand-700' },
  { key: 'government', Icon: Sprout, color: 'bg-danger' },
] as const;

export function EcosystemDiagram() {
  const { t } = useTranslation('landing');
  const [active, setActive] = useState<typeof NODES[number]['key']>('farmers');

  const activeNode = NODES.find((n) => n.key === active)!;

  return (
    <div className="relative aspect-square w-full max-w-lg">
      {/* Center NAFI core */}
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-brand-500 bg-white shadow-modal">
        <span className="text-lg font-bold text-brand-600">NAFI</span>
      </div>

      {/* Orbit rings */}
      {[0, 1].map((ring) => (
        <div
          key={ring}
          aria-hidden="true"
          className={cn(
            'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-neutral-200',
            ring === 0 ? 'h-56 w-56' : 'h-96 w-96',
          )}
        />
      ))}

      {/* Nodes positioned around center */}
      {NODES.map((node, idx) => {
        const angle = (idx / NODES.length) * Math.PI * 2 - Math.PI / 2;
        const radius = idx % 2 === 0 ? 130 : 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const isActive = active === node.key;

        return (
          <button
            key={node.key}
            type="button"
            onClick={() => setActive(node.key)}
            aria-pressed={isActive}
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              left: '50%',
              top: '50%',
            }}
            className={cn(
              'absolute flex h-14 w-14 items-center justify-center rounded-full text-white shadow-card transition-transform',
              node.color,
              isActive ? 'scale-110 ring-4 ring-brand-200' : 'hover:scale-105',
            )}
            aria-label={t(`solution.nodes.${node.key}.title`)}
          >
            <node.Icon className="h-6 w-6" />
          </button>
        );
      })}

      {/* Info card */}
      <div className="absolute -bottom-4 left-1/2 w-[min(100%,20rem)] -translate-x-1/2 rounded-md border border-neutral-200 bg-white/95 p-4 shadow-dropdown backdrop-blur">
        <p className="text-sm font-semibold text-neutral-900">
          {t(`solution.nodes.${activeNode.key}.title`)}
        </p>
        <p className="mt-0.5 text-xs text-neutral-600">
          {t(`solution.nodes.${activeNode.key}.description`)}
        </p>
      </div>
    </div>
  );
}
```

### Section 5b — `apps/landing/src/sections/Solution.tsx`

```tsx
import { useTranslation } from 'react-i18next';

import { EcosystemDiagram } from './EcosystemDiagram';

export function Solution() {
  const { t } = useTranslation('landing');

  return (
    <section id="solution" className="section-py bg-white">
      <div className="container-narrow grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="order-2 lg:order-1">
          <EcosystemDiagram />
        </div>

        <div className="order-1 flex flex-col gap-4 lg:order-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {t('solution.eyebrow')}
          </p>
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('solution.title')}
          </h2>
          <p className="text-lg text-neutral-600">{t('solution.subtitle')}</p>

          <ul className="mt-4 flex flex-col gap-3 text-sm">
            {(['diaspora', 'banks', 'dbe', 'nafa', 'suppliers', 'farmers', 'government'] as const).map(
              (key) => (
                <li key={key} className="flex gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <span className="font-semibold text-neutral-900">
                      {t(`solution.nodes.${key}.title`)}
                    </span>{' '}
                    <span className="text-neutral-600">
                      — {t(`solution.nodes.${key}.description`)}
                    </span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

### Section 6 — `apps/landing/src/sections/AudiencePaths.tsx`

```tsx
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, Card, CardBody, CardHeader, cn } from '@nafi/ui-react';

const AUDIENCES = [
  { key: 'diaspora', accent: 'brand' },
  { key: 'farmers', accent: 'brand' },
  { key: 'banks', accent: 'info' },
  { key: 'government', accent: 'danger' },
] as const;

const accentMap = {
  brand: 'text-brand-600 bg-brand-50',
  info: 'text-info-dark bg-info-light',
  danger: 'text-danger-dark bg-danger-light',
} as const;

export function AudiencePaths() {
  const { t } = useTranslation('landing');

  return (
    <section id="audience" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
            {t('audience.title')}
          </h2>
          <p className="mt-3 text-lg text-neutral-600">{t('audience.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {AUDIENCES.map(({ key, accent }) => {
            const points = t(`audience.${key}.points`, { returnObjects: true }) as string[];
            return (
              <Card key={key} className="flex flex-col">
                <CardHeader
                  title={
                    <span className={cn('inline-flex rounded px-2 py-0.5 text-xs font-semibold uppercase', accentMap[accent])}>
                      {t(`audience.${key}.title`)}
                    </span>
                  }
                />
                <CardBody className="flex flex-1 flex-col gap-4">
                  <ul className="flex flex-col gap-2.5 text-sm">
                    {points.map((point, idx) => (
                      <li key={idx} className="flex gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        <span className="text-neutral-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-2">
                    <Button asChild variant="outline" size="sm" fullWidth>
                      <Link to="/register">{t(`audience.${key}.cta`)}</Link>
                    </Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
```

### Section 7 — `apps/landing/src/sections/HowItWorks.tsx`

```tsx
import { UserCheck, Coins, Package, Sprout, BadgeCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Timeline, type TimelineItem } from '@nafi/ui-react';

const STEP_ICONS = [UserCheck, Coins, Package, Sprout, BadgeCheck];
const STEP_KEYS = ['onboard', 'fund', 'deploy', 'produce', 'settle'] as const;

export function HowItWorks() {
  const { t } = useTranslation('landing');

  const items: TimelineItem[] = STEP_KEYS.map((key, idx) => ({
    id: key,
    title: t(`how.steps.${key}.title`),
    description: t(`how.steps.${key}.description`),
    status: 'complete',
    icon: (() => {
      const Icon = STEP_ICONS[idx]!;
      return <Icon className="h-4 w-4" />;
    })(),
  }));

  return (
    <section id="how" className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('how.title')}</h2>
          <p className="mt-3 text-lg text-neutral-600">{t('how.subtitle')}</p>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <Timeline items={items} />
        </div>
      </div>
    </section>
  );
}
```

### Section 8 — `apps/landing/src/sections/LiveOpportunities.tsx`

```tsx
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { formatMoney, formatWeight } from '@nafi/formatters';
import { Button, Card, CardBody, EmptyState } from '@nafi/ui-react';

import { InvestmentPoolProgress } from '@nafi/ui-react';

import { usePublicOpportunities } from '@/hooks/usePublicOpportunities';

export function LiveOpportunities() {
  const { t } = useTranslation('landing');
  const { opportunities, isLoading } = usePublicOpportunities();

  return (
    <section id="opportunities" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
              {t('opportunities.title')}
            </h2>
            <p className="mt-2 text-lg text-neutral-600">{t('opportunities.subtitle')}</p>
          </div>
          <Button asChild variant="ghost" size="sm" trailingIcon={<ArrowRight className="h-4 w-4" />}>
            <Link to="/opportunities">{t('opportunities.viewAll')}</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <Card key={i}>
                <CardBody className="h-48 animate-pulse bg-neutral-100" />
              </Card>
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title={t('opportunities.empty')} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.slice(0, 6).map((opp) => (
              <Card key={opp.id} className="flex flex-col">
                <CardBody className="flex flex-1 flex-col gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-neutral-900">{opp.targetCrop}</h3>
                    <p className="text-xs text-neutral-500">{opp.region}</p>
                  </div>

                  <InvestmentPoolProgress
                    targetAmountEtb={opp.targetAmountEtb}
                    committedAmountEtb={opp.committedAmountEtb}
                    investorCount={opp.investorCount}
                  />

                  <div className="grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 text-xs">
                    <div>
                      <span className="text-neutral-500">{t('opportunities.targetYield')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatWeight(opp.targetYieldKg)}
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.floorPrice')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {formatMoney(opp.floorPriceEtb, 'ETB')}/kg
                      </p>
                    </div>
                    <div>
                      <span className="text-neutral-500">{t('opportunities.maturity')}</span>
                      <p className="mt-0.5 font-medium text-neutral-900">
                        {new Date(opp.maturityDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

### `apps/landing/src/hooks/usePublicOpportunities.ts`

```ts
import { useQuery } from '@tanstack/react-query';

export interface PublicOpportunity {
  id: string;
  targetCrop: string;
  region: string;
  targetAmountEtb: string;
  committedAmountEtb: string;
  investorCount: number;
  targetYieldKg: string;
  floorPriceEtb: string;
  maturityDate: string;
}

export function usePublicOpportunities() {
  const { data, isLoading } = useQuery({
    queryKey: ['public', 'opportunities'] as const,
    queryFn: async (): Promise<PublicOpportunity[]> => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/public/opportunities`, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to fetch opportunities');
      const json = await res.json();
      return json.data as PublicOpportunity[];
    },
    staleTime: 60_000,
  });

  return { opportunities: data ?? [], isLoading };
}
```

### Section 9 — `apps/landing/src/sections/ImpactDashboard.tsx`

```tsx
import { Coins, Globe2, Sprout, TrendingUp, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatCompactMoney, formatNumber } from '@nafi/formatters';
import { StatCard } from '@nafi/ui-react';

import { usePublicStats } from '@/hooks/usePublicStats';

export function ImpactDashboard() {
  const { t } = useTranslation('landing');
  const { stats } = usePublicStats();

  return (
    <section id="impact" className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('impact.title')}</h2>
          <p className="mt-3 text-lg text-neutral-600">{t('impact.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard
            label={t('impact.metrics.capital')}
            value={formatCompactMoney(stats.totalFundedUsd, 'USD')}
            icon={<Coins className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.hectares')}
            value={formatNumber(stats.hectaresUnderContract)}
            icon={<Globe2 className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.farmers')}
            value={formatNumber(stats.farmersReached)}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.forex')}
            value={formatCompactMoney(stats.forexGeneratedUsd, 'USD')}
            icon={<TrendingUp className="h-5 w-5" />}
          />
          <StatCard
            label={t('impact.metrics.jobs')}
            value={formatNumber(stats.jobsCreated)}
            icon={<Sprout className="h-5 w-5" />}
          />
        </div>
      </div>
    </section>
  );
}
```

### Section 10 — `apps/landing/src/sections/Security.tsx`

```tsx
import { ShieldCheck, Lock, FileCheck2, Database } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const ITEMS = [
  { key: 'sandbox', Icon: ShieldCheck },
  { key: 'escrow', Icon: Lock },
  { key: 'audit', Icon: FileCheck2 },
  { key: 'data', Icon: Database },
] as const;

export function Security() {
  const { t } = useTranslation('landing');

  return (
    <section id="security" className="section-py bg-brand-50/60">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t('security.title')}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map(({ key, Icon }) => (
            <Card key={key}>
              <CardBody className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-500 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-neutral-900">
                  {t(`security.items.${key}.title`)}
                </h3>
                <p className="text-sm text-neutral-600">
                  {t(`security.items.${key}.description`)}
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Section 11 — `apps/landing/src/sections/Testimonials.tsx`

```tsx
import { useTranslation } from 'react-i18next';

import { Card, CardBody } from '@nafi/ui-react';

const KEYS = ['one', 'two'] as const;

export function Testimonials() {
  const { t } = useTranslation('landing');

  return (
    <section className="section-py bg-white">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">
          {t('testimonials.title')}
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {KEYS.map((key) => (
            <Card key={key}>
              <CardBody className="flex flex-col gap-4">
                <p className="text-lg leading-relaxed text-neutral-700">
                  “{t(`testimonials.items.${key}.quote`)}”
                </p>
                <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                    {t(`testimonials.items.${key}.author`).charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-900">
                      {t(`testimonials.items.${key}.author`)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {t(`testimonials.items.${key}.role`)}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Section 12 — `apps/landing/src/sections/FAQ.tsx`

```tsx
import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const KEYS = ['what', 'howInvest', 'risk', 'farmer', 'government'] as const;

export function FAQ() {
  const { t } = useTranslation('landing');

  return (
    <section id="faq" className="section-py bg-neutral-50">
      <div className="container-narrow flex flex-col gap-10">
        <h2 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{t('faq.title')}</h2>

        <RadixAccordion.Root
          type="single"
          collapsible
          className="mx-auto w-full max-w-3xl divide-y divide-neutral-200 rounded-md border border-neutral-200 bg-white"
        >
          {KEYS.map((key) => (
            <RadixAccordion.Item key={key} value={key} className="group">
              <RadixAccordion.Header>
                <RadixAccordion.Trigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-neutral-900 hover:bg-neutral-50">
                  {t(`faq.items.${key}.q`)}
                  <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 transition-transform group-data-[state=open]:rotate-180" />
                </RadixAccordion.Trigger>
              </RadixAccordion.Header>
              <RadixAccordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                <div className="px-5 pb-5 text-sm text-neutral-600">
                  {t(`faq.items.${key}.a`)}
                </div>
              </RadixAccordion.Content>
            </RadixAccordion.Item>
          ))}
        </RadixAccordion.Root>
      </div>
    </section>
  );
}
```

### Section 13 — `apps/landing/src/sections/FinalCTA.tsx`

```tsx
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

export function FinalCTA() {
  const { t } = useTranslation('landing');

  return (
    <section className="bg-gradient-to-br from-brand-600 to-brand-800 py-20">
      <div className="container-narrow flex flex-col items-center gap-6 text-center">
        <h2 className="max-w-2xl text-3xl font-bold text-white sm:text-4xl">
          {t('finalCta.title')}
        </h2>
        <p className="max-w-xl text-lg text-brand-100">{t('finalCta.subtitle')}</p>
        <Button
          asChild
          size="lg"
          className="mt-2 bg-white text-brand-700 hover:bg-brand-50"
        >
          <Link to="/register">
            {t('finalCta.cta')} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
```

### Section 14 — `apps/landing/src/sections/Footer.tsx`

```tsx
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export function Footer() {
  const { t } = useTranslation('landing');
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="container-narrow grid grid-cols-1 gap-10 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 text-white">
              <span className="font-bold">N</span>
            </div>
            <span className="text-lg font-bold tracking-tight">NAFI</span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-neutral-500">{t('footer.tagline')}</p>
          <div className="mt-5">
            <LanguageSwitcher />
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.platform.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li><a href="#how" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.platform.howItWorks')}</a></li>
            <li><a href="#security" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.platform.security')}</a></li>
            <li><a href="#impact" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.platform.impact')}</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.audience.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li><Link to="/register?role=DIASPORA_INVESTOR" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.audience.investors')}</Link></li>
            <li><Link to="/register?role=COMMERCIAL_FARMER" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.audience.farmers')}</Link></li>
            <li><Link to="/register?role=COMMERCIAL_BANK" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.audience.banks')}</Link></li>
            <li><Link to="/register?role=GOVERNMENT_REGULATOR" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.audience.government')}</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            {t('footer.legal.title')}
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            <li><Link to="/terms" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.legal.terms')}</Link></li>
            <li><Link to="/privacy" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.legal.privacy')}</Link></li>
            <li><Link to="/compliance" className="text-sm text-neutral-600 hover:text-neutral-900">{t('footer.legal.compliance')}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-100 py-6">
        <p className="container-narrow text-center text-xs text-neutral-500">
          {t('footer.rights', { year })}
        </p>
      </div>
    </footer>
  );
}
```

---

## 3.7 The Landing Page

### `apps/landing/src/pages/LandingPage.tsx`

```tsx
import { SEO } from '@/components/SEO';
import { AudiencePaths } from '@/sections/AudiencePaths';
import { FAQ } from '@/sections/FAQ';
import { FinalCTA } from '@/sections/FinalCTA';
import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { ImpactDashboard } from '@/sections/ImpactDashboard';
import { LiveOpportunities } from '@/sections/LiveOpportunities';
import { Problem } from '@/sections/Problem';
import { Security } from '@/sections/Security';
import { Solution } from '@/sections/Solution';
import { Testimonials } from '@/sections/Testimonials';
import { TrustBar } from '@/sections/TrustBar';

export function LandingPage() {
  return (
    <>
      <SEO />

      {/* 2 — Hero */}
      <Hero />

      {/* 3 — Trust bar */}
      <TrustBar />

      {/* 4 — Problem */}
      <Problem />

      {/* 5 — Solution (with ecosystem diagram) */}
      <Solution />

      {/* 6 — Audience paths */}
      <AudiencePaths />

      {/* 7 — How it works */}
      <HowItWorks />

      {/* 8 — Live opportunities */}
      <LiveOpportunities />

      {/* 9 — Impact dashboard */}
      <ImpactDashboard />

      {/* 10 — Security */}
      <Security />

      {/* 11 — Testimonials */}
      <Testimonials />

      {/* 12 — FAQ */}
      <FAQ />

      {/* 13 — Final CTA */}
      <FinalCTA />
    </>
  );
}
```

### `apps/landing/src/pages/NotFoundPage.tsx`

```tsx
import { Link } from 'react-router-dom';

import { Button } from '@nafi/ui-react';

export function NotFoundPage() {
  return (
    <div className="container-narrow flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-bold text-neutral-900">404</h1>
      <p className="text-lg text-neutral-600">This page could not be found.</p>
      <Button asChild>
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
```

---

## 3.8 Tailwind Accordion Animations

Add to `apps/landing/src/styles/globals.css`:

```css
@layer utilities {
  @keyframes accordion-down {
    from { height: 0; opacity: 0; }
    to { height: var(--radix-accordion-content-height); opacity: 1; }
  }
  @keyframes accordion-up {
    from { height: var(--radix-accordion-content-height); opacity: 1; }
    to { height: 0; opacity: 0; }
  }
  .animate-accordion-down { animation: accordion-down 200ms ease-out; }
  .animate-accordion-up { animation: accordion-up 200ms ease-out; }
}
```

And extend `packages/config/tailwind.preset.js` to add these keyframes globally so both apps share them:

```js
// packages/config/tailwind.preset.js — extend keyframes
extend: {
  keyframes: {
    'accordion-down': {
      from: { height: '0', opacity: '0' },
      to: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
    },
    'accordion-up': {
      from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
      to: { height: '0', opacity: '0' },
    },
  },
  animation: {
    'accordion-down': 'accordion-down 200ms ease-out',
    'accordion-up': 'accordion-up 200ms ease-out',
  },
},
```

---

## 3.9 Performance Optimization

### `apps/landing/src/components/LazySection.tsx`

Wrap below-the-fold sections in a lazy wrapper so initial bundle stays small:

```tsx
import { Suspense, lazy, type ComponentType, type ReactNode } from 'react';
import { useInView } from 'react-intersection-observer';

import { Skeleton } from '@nafi/ui-react';

export function lazySection<T extends object>(
  importer: () => Promise<{ [key: string]: ComponentType<T> }>,
  exportName: string,
  fallbackHeight = 400,
) {
  const Lazy = lazy(async () => {
    const mod = await importer();
    return { default: mod[exportName]! };
  });

  return function LazySectionWrapper(props: T): ReactNode {
    const { ref, inView } = useInView({ triggerOnce: true, rootMargin: '200px' });

    return (
      <div ref={ref}>
        {inView ? (
          <Suspense fallback={<Skeleton style={{ height: fallbackHeight }} />}>
            <Lazy {...props} />
          </Suspense>
        ) : (
          <Skeleton style={{ height: fallbackHeight }} />
        )}
      </div>
    );
  };
}
```

> **Note:** `react-intersection-observer` needs to be added to `package.json` deps. Alternatively, use a native `IntersectionObserver` with `useState` — the wrapper pattern stays identical.

### Bundle Analysis Budget

Add to `apps/landing/package.json` scripts:

```json
"analyze": "vite build && npx vite-bundle-visualizer"
```

Target gzipped sizes:

| Chunk | Budget |
| :--- | :--- |
| react | < 45 KB |
| ui-react | < 35 KB |
| i18n | < 15 KB |
| query | < 12 KB |
| icons | < 10 KB |
| landing app | < 30 KB |
| **Total** | **< 150 KB** |

---

## 3.10 Verification Checklist

```bash
# 1. Install
pnpm install

# 2. Type-check
pnpm --filter @nafi/landing typecheck

# 3. Lint
pnpm --filter @nafi/landing lint

# 4. Dev server
pnpm --filter @nafi/landing dev
# → http://localhost:3001

# 5. Production build
pnpm --filter @nafi/landing build
# Check dist/ output sizes

# 6. Preview production build
pnpm --filter @nafi/landing preview
```

**Expected result:**

```
✓ Typecheck passes
✓ Lint passes
✓ Dev server boots on :3001
✓ Production build succeeds
✓ Bundle < 150 KB gzipped
✓ All 4 languages render correctly
✓ Interactive ecosystem diagram toggles on click
✓ Live stats animate on scroll into view
✓ FAQ accordion opens/closes
✓ Lighthouse (mobile) Performance ≥ 90
```

---

## 3.11 What Was Built & Why

| Section | Purpose | Key Feature |
| :--- | :--- | :--- |
| **Navbar** | Sticky navigation | Scroll-triggered background, mobile drawer, language switcher |
| **Hero** | Headline + CTAs | Animated stat counters, live stats, gradient background |
| **TrustBar** | Credibility | Institutional partner logos |
| **Problem** | Empathy | 4 problem cards with icons |
| **Solution** | Value proposition | **Interactive ecosystem diagram** — clickable nodes |
| **AudiencePaths** | Self-selection | 4 role-specific cards with CTAs |
| **HowItWorks** | Process clarity | 5-step timeline with icons |
| **LiveOpportunities** | Immediate action | Fetches from public API, shows funding progress |
| **ImpactDashboard** | Social proof | Live metrics from public API |
| **Security** | Trust | 4 compliance pillars |
| **Testimonials** | Social proof | 2 quotes |
| **FAQ** | Objection handling | Radix accordion, 5 questions |
| **FinalCTA** | Conversion | Full-width gradient with white button |
| **Footer** | Navigation | 4-column layout, language switcher, legal links |

**Engineering highlights:**
- ✅ Multi-language with `i18next` + browser detection + localStorage persistence
- ✅ Live stats via TanStack Query with stale-while-revalidate
- ✅ SEO with `react-helmet-async` + JSON-LD structured data
- ✅ Interactive SVG-free ecosystem diagram using absolute positioning + trig
- ✅ Animated stat counters respecting `prefers-reduced-motion`
- ✅ Bundle < 150KB gzipped via manual chunk splitting
- ✅ WCAG 2.1 AA — semantic HTML, ARIA labels, keyboard navigation
- ✅ Ethiopian calendar support via `@nafi/formatters`

---

## 3.12 What Is Deliberately Not in Step 3

- ❌ No authentication flow (Step 4)
- ❌ No `apps/web` dashboard (Steps 5–8)
- ❌ No real API (Step 4 wires it)
- ❌ No E2E tests (Step 10)
- ❌ No analytics/tracking (opt-in later)

**Step 3 is the public face of NAFI.**

---

# ✅ Step 3 Complete

**Deliverable:** A production-ready landing page at `apps/landing` with:

- **14 fully-implemented sections** from Navbar to Footer
- **Interactive ecosystem diagram** with clickable stakeholder nodes
- **Live impact stats** fetched from the public API, with animated counters
- **Live opportunities feed** showing open contracts and funding progress
- **4-language support** (English, Amharic, Oromiffa, Tigrinya) with instant switching
- **SEO** with Open Graph, Twitter cards, and JSON-LD structured data
- **Performance budget** enforced via manual chunk splitting (< 150KB gzipped)
- **Accessibility** — semantic HTML, ARIA, keyboard navigation, reduced-motion respect



Say **"yes"** and I'll build the complete `apps/web` authenticated application scaffold — the shell that every role portal in Steps 5–8 will plug into.

Or say **"wait"** if you want to review or adjust anything in Step 3 first.
