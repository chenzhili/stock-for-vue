module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: ['plugin:vue/essential', 'plugin:vue/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    ENV: true,
  },
  parserOptions: {
    parser: "@babel/eslint-parser",
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    // "indent": [
    //   "error",
    //   4
    // ],
    'linebreak-style': ['off', 'unix'],
    quotes: ['off', 'single'],
    'no-unused-vars': 'off',
    // "semi": [
    //   "error",
    //   "always"
    // ]
  },
}
