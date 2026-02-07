import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test.ts'],
    include: ['src/**/*.spec.ts'],
    exclude: ['node_modules'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test.ts'
      ]
    },
    deps: {
      inline: ['@angular/core', '@angular/common', '@angular/forms']
    }
  }
});
