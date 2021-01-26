module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    commonjs: true,
    es6: true,
  },
  // parser: 'babel-eslint',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
      experimentalObjectRestSpread: true,
    },
    ecmaVersion: 7,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-unused-vars': 'off',
    'semi': 'warn',
    'no-var': 'warn',
    'arrow-spacing': 'warn',
    // 'indent': ['warn', 2, { SwitchCase: 1 }],
    'indent': 'off',
    '@typescript-eslint/indent': ['warn', 2, {
      SwitchCase: 1,
      // MemberExpression: 1,
      // VariableDeclarator: 2,
      // flatTernaryExpressions: true,
      // ignoredNodes: [],
    }],
  }
};