import forms from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import aspectRatio from '@tailwindcss/aspect-ratio';

export const colors = {
  brand: {
    50: '#F2F8F5',
    100: '#DFEFE7',
    200: '#BEDFD1',
    300: '#94CBB6',
    400: '#60AF95',
    500: '#2A8F70',
    600: '#1C7458',
    700: '#165C46',
    800: '#124938',
    900: '#0C2D23',
    950: '#071B15',
  },
  accent: {
    50: '#FDFBF6',
    100: '#FAF3E3',
    200: '#F5E6C2',
    300: '#ECD292',
    400: '#DFBA5A',
    500: '#C79A2F',
    600: '#A77B1E',
    700: '#855E18',
    800: '#6B4916',
    900: '#533813',
  },
  neutral: {
    0: '#FFFFFF',
    50: '#F9FAF9',
    100: '#F1F4F2',
    200: '#E3E7E4',
    300: '#CDD4D0',
    400: '#97A29C',
    500: '#687670',
    600: '#4A5651',
    700: '#343E3A',
    800: '#202724',
    900: '#121715',
    950: '#0A0E0C',
    1000: '#000000',
  },
  success: {
    light: '#DFEFE7',
    DEFAULT: '#1C7458',
    dark: '#165C46',
  },
  warning: {
    light: '#FAF3E3',
    DEFAULT: '#C79A2F',
    dark: '#855E18',
  },
  danger: {
    light: '#FEE2E2',
    DEFAULT: '#DC2626',
    dark: '#991B1B',
  },
  info: {
    light: '#E8F1FA',
    DEFAULT: '#1B6CA8',
    dark: '#155280',
  },
  primary: {
    50: '#F2F8F5',
    100: '#DFEFE7',
    200: '#BEDFD1',
    300: '#94CBB6',
    400: '#60AF95',
    500: '#2A8F70',
    600: '#1C7458',
    700: '#165C46',
    800: '#124938',
    900: '#0C2D23',
    DEFAULT: '#1C7458',
  },
  secondary: {
    50: '#FDFBF6',
    100: '#FAF3E3',
    200: '#F5E6C2',
    300: '#ECD292',
    400: '#DFBA5A',
    500: '#C79A2F',
    600: '#A77B1E',
    700: '#855E18',
    800: '#6B4916',
    900: '#533813',
    DEFAULT: '#C79A2F',
  },
};

export const typography = {
  fontFamily: {
    sans: ['"Noto Sans Ethiopic"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'].join(', '),
    mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'].join(', '),
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  32: '8rem',
};

export const radii = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.5rem',
  full: '9999px',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  dropdown: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  modal: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  focus: '0 0 0 3px rgb(22 163 74 / 0.35)',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    screens: breakpoints,
    extend: {
      colors,
      spacing,
      borderRadius: radii,
      boxShadow: shadows,
      fontFamily: typography.fontFamily,
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      ringColor: {
        DEFAULT: colors.brand[500],
      },
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
  },
  plugins: [forms, typographyPlugin, aspectRatio],
};
