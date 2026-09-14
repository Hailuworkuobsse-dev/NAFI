/**
 * NAFI Brand Palette
 * Primary: Ethiopian earth + growth green
 * Accent:  Harvest gold
 * Semantic colors map to system states.
 */
export const colors = {
  brand: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#16A34A',
    600: '#15803D',
    700: '#166534',
    800: '#14532D',
    900: '#052E16',
  },
  accent: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    1000: '#000000',
  },
  success: {
    light: '#DCFCE7',
    DEFAULT: '#16A34A',
    dark: '#15803D',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#B45309',
  },
  danger: {
    light: '#FEE2E2',
    DEFAULT: '#DC2626',
    dark: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#2563EB',
    dark: '#1E40AF',
  },
} as const;

/**
 * Role → accent color mapping.
 * Used consistently across the platform so each role's portal
 * has a recognizable visual identity.
 */
export const roleAccents = {
  DIASPORA_INVESTOR: 'brand',
  COMMERCIAL_BANK: 'info',
  DBE_OFFICER: 'accent',
  NAFA_OFFICER: 'accent',
  INPUT_SUPPLIER: 'neutral',
  COMMERCIAL_FARMER: 'brand',
  OFF_TAKER: 'neutral',
  GOVERNMENT_REGULATOR: 'danger',
  DONOR: 'info',
  NAFI_ADMIN: 'neutral',
  COMPLIANCE_OFFICER: 'danger',
  ARBITRATOR: 'warning',
} as const;

export type ColorToken = keyof typeof colors;
export type RoleAccent = (typeof roleAccents)[keyof typeof roleAccents];
