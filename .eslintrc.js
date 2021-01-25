module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
  },
  // parser: "babel-eslint",
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true,
    },
    ecmaVersion: 7,
    sourceType: 'module',
  },
  rules: {
    'no-unused-vars': 'off',
    'semi': 'warn',
    'no-var': 'warn',
    'arrow-spacing': 'warn',
    'indent': ["warn", 2, { SwitchCase: 1 }],
  }
};