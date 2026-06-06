import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/tests/systems/ai/CultivationOrder.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: ['src/systems/ai/CultivationOrder.js'],
      exclude: [],
      thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 }
    }
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } }
});
