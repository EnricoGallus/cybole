import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/test/**/*.test.ts', '<rootDir>/test/**/*.test.tsx'],
    transform: {
        '^.+\\.[jt]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
    },
    transformIgnorePatterns: ['/node_modules/(?!react-xml-editor/)'],
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/test/setupTests.ts'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/main.tsx'],
    clearMocks: true,
};

export default config;
