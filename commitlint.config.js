export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'contracts',
        'escrow',
        'investments',
        'inputs',
        'settlement',
        'collateral',
        'disputes',
        'reporting',
        'auth',
        'rbac',
        'ui',
        'i18n',
        'api',
        'deps',
        'ci',
        'docs',
      ],
    ],
  },
};
