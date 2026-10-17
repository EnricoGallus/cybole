import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(viteConfig, defineConfig({
    test: {
        include: ['test/**/*.test.{ts,tsx}'],
        environment: 'jsdom',
        setupFiles: ['test/setupTests.ts'],
        clearMocks: true,
        coverage: {
            provider: 'v8',
            include: ['src/utils/**/*.{ts,tsx}', 'src/platform/**/*.{ts,tsx}'],
            reporter: ['text', 'html', 'lcov'],
        },
    },
}));
