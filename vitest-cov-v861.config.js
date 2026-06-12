import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationDreamPillRefining.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationDreamPillRefining.js'],
      thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
    }
  }
});
