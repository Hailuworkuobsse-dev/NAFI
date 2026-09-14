import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'NAFI Design System',
    brandUrl: 'https://nafi.et',
    brandTarget: '_blank',
    colorPrimary: '#16A34A',
    colorSecondary: '#15803D',
  }),
});
