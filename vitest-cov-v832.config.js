import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationAmber.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationAmber.js'],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 95 }
    }
  }
});
