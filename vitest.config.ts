import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 25000,
    hookTimeout: 30000,
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'supabase'],
  },
});
