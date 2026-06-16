import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationSlate.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationSlate.js'],
      thresholds: { lines: 95, functions: 95, statements: 95, branches: 95 }
    }
  }
});
