import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    plugins: {
      prettier,
    },
    rules: {
      ...prettier.rules,
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'semi': ['error', 'always'],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'comma-dangle': ['error', 'always-multiline'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      'no-multiple-empty-lines': ['error', { max: 1 }],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'func-style': ['error', 'declaration'],
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // Browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        sessionStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        prompt: 'readonly',
        setTimeout: 'readonly',
        setInterval: 'readonly',
        clearTimeout: 'readonly',
        clearInterval: 'readonly',
        requestAnimationFrame: 'readonly',
        fetch: 'readonly',
        XMLHttpRequest: 'readonly',
        Image: 'readonly',
        Audio: 'readonly',
        
        // Test globals (Vitest)
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
        vitest: 'readonly',
        
        // App globals (will be loaded in browser)
        State: 'writable',
        Utils: 'writable',
        Storage: 'writable',
        GameLogic: 'writable',
        UI: 'writable',
        Accessibility: 'writable',
        ConjuMaster: 'writable',
        VERBS: 'readonly',
        LESSONS: 'readonly',
        escapeHtml: 'readonly',
        sanitizeInput: 'readonly',
        showToast: 'readonly',
        launchConfetti: 'readonly',
        updateUI: 'readonly',
        navigateTo: 'readonly',
        toggleSidebar: 'readonly',
        toggleTheme: 'readonly',
      },
    },
  },
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/',
      'dist/',
      'coverage/',
      '*.min.js',
    ],
  },
];
