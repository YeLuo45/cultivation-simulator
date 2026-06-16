import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/systems/ai/CultivationCycle.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/systems/ai/CultivationCycle.js'],
      exclude: [],
      thresholds: { statements: 99, branches: 99, functions: 99, lines: 99 }
    }
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});
