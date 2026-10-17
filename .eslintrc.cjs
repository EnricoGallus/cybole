module.exports = {
    root: true,
    env: { browser: true, es2021: true },
    parser: '@typescript-eslint/parser',
    parserOptions: { ecmaVersion: 2021, sourceType: 'module' },
    plugins: ['@typescript-eslint', 'react-hooks'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['node_modules/', 'dist/', 'coverage/', 'src-tauri/'],
    rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
    overrides: [
        {
            files: ['test/**/*.{ts,tsx}'],
            env: { node: true },
        },
        {
            files: ['*.config.ts', '*.cjs'],
            env: { browser: false, node: true },
        },
    ],
};
