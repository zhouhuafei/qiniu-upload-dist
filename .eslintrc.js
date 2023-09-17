// https://typescript-eslint.io/getting-started/#step-2-configuration
module.exports = {
  root: true,
  env: {
    node: true
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  rules: {}
}
