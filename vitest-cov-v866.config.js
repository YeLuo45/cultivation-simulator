import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    include: ['src/tests/systems/ai/CultivationDreamSpiritRootAwakening.test.js'],
    coverage: {
      include: ['src/systems/ai/CultivationDreamSpiritRootAwakening.js'],
      thresholds: { lines: 99, functions: 99, statements: 99, branches: 99 }
    }
  }
});
