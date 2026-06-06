import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/systems/ai/CultivationDaoist.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json'],
      include: ['src/systems/ai/CultivationDaoist.js'],
      exclude: [],
      thresholds: { statements: 0, branches: 0, functions: 0, lines: 0 }
    }
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});
