import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': root,
    },
  },
  test: {
    include: [
      'signal/**/*.test.ts',
      'content/**/*.test.ts',
      'progress/**/*.test.ts',
    ],
  },
});
