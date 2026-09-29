import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['signal/**/*.test.ts', 'content/**/*.test.ts'],
  },
});
