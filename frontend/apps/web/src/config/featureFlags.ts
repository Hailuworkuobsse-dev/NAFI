export const featureFlags = {
  ussdSimulator: import.meta.env.VITE_ENABLE_USSD === 'true',
  pushNotifications: import.meta.env.VITE_ENABLE_PUSH === 'true',
  offlineMode: import.meta.env.VITE_ENABLE_OFFLINE_MODE === 'true',
  multiPartyRelease: import.meta.env.VITE_ENABLE_MULTIPARTY === 'true',
} as const;

export type FeatureFlag = keyof typeof featureFlags;
